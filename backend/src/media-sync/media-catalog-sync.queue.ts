import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { BullQueueService } from "@/common/bull/bull-queue.service";
import {
  externalMetadataQueueRedisOptions,
  jobErrorFromUnknown
} from "@/common/bull/external-metadata-queue";
import {
  logQueueJobEnqueueFailed,
  logQueueJobEnqueued
} from "@/common/bull/queue-infrastructure-logging";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { PrismaService } from "@/prisma/prisma.service";

import {
  DEFAULT_MEDIA_CATALOG_SYNC_JOB_MAX_ATTEMPTS,
  MEDIA_CATALOG_SYNC_PUBLICATION_RECONCILE_INTERVAL_MS,
  MEDIA_CATALOG_SYNC_PUBLICATION_STALE_GRACE_MS,
  type MediaCatalogSyncPublicationTarget,
  type QueueJobLookupResult,
  buildMediaCatalogSyncJobId,
  buildQueueJobLookupResult,
  buildStalePublishedPublicationCasWhere,
  canAbandonPublicationAfterLookup,
  resolvePublicationAttempt,
  resolveStalePublishedTerminalFailureMessage,
  shouldRecoverStalePublishedTerminalFailure,
  shouldResetStalePublishedPublication,
  shouldSkipPublicationReconciliation
} from "@/media-sync/lib/media-catalog-sync-publication";
import { finalizeMediaSyncRunIfComplete } from "@/media-sync/lib/media-sync-run-completion";
import {
  ORPHANED_RUNNING_SYNC_RUN_ERROR_MESSAGE,
  isOrphanedRunningSyncRun
} from "@/media-sync/lib/media-sync-run-scheduling";
import { MediaCatalogSyncService } from "@/media-sync/media-catalog-sync.service";

import {
  MediaSyncJobPublicationStatus,
  MediaSyncMediaType,
  MediaSyncRunStatus
} from "@prisma/client";
import type Bull from "bull";
import { v4 as uuidv4 } from "uuid";

export type MediaCatalogSyncJobData = {
  syncRunId: string;
  mediaType: MediaSyncMediaType;
  mediaId: number;
  correlation_id?: string;
  request_id?: string | null;
};

type PublicationRow = {
  id: string;
  syncRunId: string;
  mediaType: MediaSyncMediaType;
  mediaId: number;
  bullJobId: string;
  correlationId: string;
  attemptCount: number;
};

@Injectable()
export class MediaCatalogSyncQueueService
  implements OnModuleInit, OnModuleDestroy
{
  private queue!: Bull.Queue<MediaCatalogSyncJobData>;
  private reconciliationTimer: NodeJS.Timeout | null = null;
  private reconciliationInFlight = false;
  private isShuttingDown = false;

  constructor(
    private readonly bullQueue: BullQueueService,
    private readonly catalogSyncService: MediaCatalogSyncService,
    private readonly prisma: PrismaService,
    private readonly logger: StructuredLogger
  ) {}

  onModuleInit(): void {
    this.queue = this.bullQueue.createQueue<MediaCatalogSyncJobData>(
      "mediaCatalogSyncQueue",
      externalMetadataQueueRedisOptions
    );
    void this.queue.process((job) => this.processJob(job));
    void this.reconcilePendingPublications("startup");
    this.reconciliationTimer = setInterval(() => {
      void this.reconcilePendingPublications("interval");
    }, MEDIA_CATALOG_SYNC_PUBLICATION_RECONCILE_INTERVAL_MS);
    void this.recoverIncompleteRuns();
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    if (this.reconciliationTimer) {
      clearInterval(this.reconciliationTimer);
      this.reconciliationTimer = null;
    }
    await this.queue.close();
  }

  async createPublications(
    jobs: readonly MediaCatalogSyncPublicationTarget[]
  ): Promise<void> {
    if (jobs.length === 0) {
      return;
    }

    await this.prisma.mediaSyncJobPublication.createMany({
      data: jobs.map((job) => ({
        syncRunId: job.syncRunId,
        mediaType: job.mediaType,
        mediaId: job.mediaId,
        bullJobId: buildMediaCatalogSyncJobId(job),
        correlationId: uuidv4(),
        status: MediaSyncJobPublicationStatus.PENDING
      })),
      skipDuplicates: true
    });
  }

  async enqueue(
    job: Omit<MediaCatalogSyncJobData, "correlation_id" | "request_id">
  ): Promise<boolean> {
    const publication = await this.ensurePublication(job);
    return this.publishPublication(publication);
  }

  async finalizeRunIfComplete(syncRunId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await finalizeMediaSyncRunIfComplete(tx, syncRunId);
    });
  }

  private async ensurePublication(
    job: MediaCatalogSyncPublicationTarget
  ): Promise<PublicationRow> {
    const bullJobId = buildMediaCatalogSyncJobId(job);

    return this.prisma.mediaSyncJobPublication.upsert({
      where: {
        syncRunId_mediaType_mediaId: {
          syncRunId: job.syncRunId,
          mediaType: job.mediaType,
          mediaId: job.mediaId
        }
      },
      create: {
        syncRunId: job.syncRunId,
        mediaType: job.mediaType,
        mediaId: job.mediaId,
        bullJobId,
        correlationId: uuidv4(),
        status: MediaSyncJobPublicationStatus.PENDING
      },
      update: {},
      select: {
        id: true,
        syncRunId: true,
        mediaType: true,
        mediaId: true,
        bullJobId: true,
        correlationId: true,
        attemptCount: true
      }
    });
  }

  private async publishPublication(
    publication: PublicationRow
  ): Promise<boolean> {
    const existingPublished =
      await this.prisma.mediaSyncJobPublication.findUnique({
        where: { id: publication.id },
        select: { status: true }
      });
    if (existingPublished?.status === MediaSyncJobPublicationStatus.PUBLISHED) {
      return true;
    }

    if (await this.hasTerminalSyncItem(publication)) {
      await this.markPublicationPublished(publication.id);
      return true;
    }

    const lookupBeforePublish = await this.lookupQueueJob(
      publication.bullJobId
    );
    if (lookupBeforePublish.state === "present") {
      await this.markPublicationPublished(publication.id);
      return true;
    }
    if (lookupBeforePublish.state === "terminal_failed") {
      await this.recordTerminalPublicationFailure(
        publication,
        resolveStalePublishedTerminalFailureMessage(
          lookupBeforePublish.failedReason
        )
      );
      await this.finalizeRunIfComplete(publication.syncRunId);
      return false;
    }
    if (lookupBeforePublish.state === "unknown") {
      await this.keepPublicationPending(
        publication.id,
        publication.attemptCount,
        "Queue job lookup failed before publish; publication remains pending"
      );
      return false;
    }

    const jobData: MediaCatalogSyncJobData = {
      syncRunId: publication.syncRunId,
      mediaType: publication.mediaType,
      mediaId: publication.mediaId,
      correlation_id: publication.correlationId,
      request_id: null
    };

    try {
      const created = await this.queue.add(jobData, {
        jobId: publication.bullJobId
      });
      logQueueJobEnqueued(this.logger, {
        queue_name: "mediaCatalogSyncQueue",
        job_id: String(created.id),
        job_name: "sync-media-catalog",
        correlation_id: publication.correlationId,
        request_id: null,
        meta: {
          sync_run_id: publication.syncRunId,
          media_type: publication.mediaType,
          media_id: publication.mediaId,
          publication_id: publication.id
        }
      });
      await this.markPublicationPublished(publication.id);
      return true;
    } catch (error: unknown) {
      logQueueJobEnqueueFailed(this.logger, {
        queue_name: "mediaCatalogSyncQueue",
        job_name: "sync-media-catalog",
        correlation_id: publication.correlationId,
        request_id: null,
        error,
        meta: {
          sync_run_id: publication.syncRunId,
          media_type: publication.mediaType,
          media_id: publication.mediaId,
          publication_id: publication.id
        }
      });

      const jobLookup = await this.lookupQueueJob(publication.bullJobId);
      const attempt = resolvePublicationAttempt({
        error,
        attemptCount: publication.attemptCount,
        jobLookup: jobLookup.state
      });

      if (attempt.kind === "published") {
        await this.markPublicationPublished(publication.id);
        return true;
      }

      if (attempt.kind === "pending") {
        await this.keepPublicationPending(
          publication.id,
          attempt.attemptCount,
          attempt.lastError
        );
        return false;
      }

      const terminalItemExists = await this.hasTerminalSyncItem(publication);
      if (terminalItemExists) {
        await this.markPublicationPublished(publication.id);
        return true;
      }

      const finalLookup = await this.lookupQueueJob(publication.bullJobId);
      if (finalLookup.state === "present") {
        await this.markPublicationPublished(publication.id);
        return true;
      }
      if (finalLookup.state === "terminal_failed") {
        await this.recordTerminalPublicationFailure(
          publication,
          resolveStalePublishedTerminalFailureMessage(finalLookup.failedReason)
        );
        await this.finalizeRunIfComplete(publication.syncRunId);
        return false;
      }
      if (!canAbandonPublicationAfterLookup(finalLookup.state)) {
        await this.keepPublicationPending(
          publication.id,
          attempt.attemptCount,
          "Queue job lookup failed after publish attempts; publication remains pending"
        );
        return false;
      }

      await this.recordTerminalPublicationFailure(
        publication,
        attempt.lastError
      );
      await this.finalizeRunIfComplete(publication.syncRunId);
      return false;
    }
  }

  private async lookupQueueJob(
    bullJobId: string
  ): Promise<QueueJobLookupResult> {
    try {
      const job = await this.queue.getJob(bullJobId);
      if (job == null) {
        return buildQueueJobLookupResult(null);
      }

      const state = await job.getState();
      const maxAttempts =
        typeof job.opts.attempts === "number"
          ? job.opts.attempts
          : DEFAULT_MEDIA_CATALOG_SYNC_JOB_MAX_ATTEMPTS;

      return buildQueueJobLookupResult({
        state,
        attemptsMade: job.attemptsMade,
        maxAttempts,
        failedReason:
          typeof job.failedReason === "string" ? job.failedReason : null
      });
    } catch (error: unknown) {
      this.logger.logQueue({
        level: "warn",
        event: "queue.publication.lookup_failed",
        message: "Queue job lookup failed; publication state remains unknown",
        correlation_id: null,
        request_id: null,
        user_id: null,
        error: jobErrorFromUnknown(error),
        meta: {
          queue_name: "mediaCatalogSyncQueue",
          job_id: bullJobId,
          job_name: "sync-media-catalog",
          attempt: 0,
          max_attempts: 0,
          duration_ms: null,
          bull_job_id: bullJobId
        }
      });
      return { state: "unknown", failedReason: null };
    }
  }

  private async keepPublicationPending(
    publicationId: string,
    attemptCount: number,
    lastError: string
  ): Promise<void> {
    await this.prisma.mediaSyncJobPublication.update({
      where: { id: publicationId },
      data: {
        attemptCount,
        lastError
      }
    });
  }

  private async hasTerminalSyncItem(
    publication: PublicationRow
  ): Promise<boolean> {
    const item = await this.prisma.mediaSyncItem.findFirst({
      where: {
        syncRunId: publication.syncRunId,
        mediaType: publication.mediaType,
        mediaId: publication.mediaId
      },
      select: { id: true }
    });
    return item !== null;
  }

  private async markPublicationPublished(publicationId: string): Promise<void> {
    await this.prisma.mediaSyncJobPublication.update({
      where: { id: publicationId },
      data: {
        status: MediaSyncJobPublicationStatus.PUBLISHED,
        publishedAt: new Date(),
        lastError: null,
        attemptCount: 0
      }
    });
  }

  private async recordTerminalPublicationFailure(
    publication: PublicationRow,
    errorMessage: string
  ): Promise<void> {
    await this.catalogSyncService.recordTerminalSyncFailure({
      syncRunId: publication.syncRunId,
      mediaType: publication.mediaType,
      mediaId: publication.mediaId,
      errorMessage
    });
    await this.abandonPublication(publication, errorMessage);
  }

  private async abandonPublication(
    publication: PublicationRow,
    lastError: string
  ): Promise<void> {
    await this.prisma.mediaSyncJobPublication.update({
      where: { id: publication.id },
      data: {
        status: MediaSyncJobPublicationStatus.FAILED,
        attemptCount: { increment: 1 },
        lastError,
        failedAt: new Date()
      }
    });
  }

  private async reconcilePendingPublications(
    trigger: "startup" | "interval"
  ): Promise<void> {
    if (
      shouldSkipPublicationReconciliation({
        isShuttingDown: this.isShuttingDown,
        reconciliationInFlight: this.reconciliationInFlight
      })
    ) {
      return;
    }

    this.reconciliationInFlight = true;
    try {
      await this.recoverPendingPublications();
      await this.recoverStalePublishedPublications();
      await this.recoverStrandedFailedPublications();
    } catch (error: unknown) {
      this.logger.logQueue({
        level: "error",
        event: "queue.publication.reconcile_failed",
        message: "Failed to reconcile pending catalog sync publications",
        correlation_id: null,
        request_id: null,
        user_id: null,
        error: jobErrorFromUnknown(error),
        meta: {
          queue_name: "mediaCatalogSyncQueue",
          job_id: null,
          job_name: "sync-media-catalog",
          attempt: 0,
          max_attempts: 0,
          duration_ms: null,
          reconcile_trigger: trigger
        }
      });
    } finally {
      this.reconciliationInFlight = false;
    }
  }

  private async recoverPendingPublications(): Promise<void> {
    const pending = await this.prisma.mediaSyncJobPublication.findMany({
      where: { status: MediaSyncJobPublicationStatus.PENDING },
      orderBy: { updatedAt: "asc" },
      take: 500,
      select: {
        id: true,
        syncRunId: true,
        mediaType: true,
        mediaId: true,
        bullJobId: true,
        correlationId: true,
        attemptCount: true
      }
    });

    for (const publication of pending) {
      await this.publishPublication(publication);
      await this.finalizeRunIfComplete(publication.syncRunId);
    }
  }

  private async recoverStalePublishedPublications(): Promise<void> {
    const staleThreshold = new Date(
      Date.now() - MEDIA_CATALOG_SYNC_PUBLICATION_STALE_GRACE_MS
    );

    const stalePublished = await this.prisma.mediaSyncJobPublication.findMany({
      where: {
        status: MediaSyncJobPublicationStatus.PUBLISHED,
        publishedAt: { lt: staleThreshold }
      },
      orderBy: { publishedAt: "asc" },
      take: 500,
      select: {
        id: true,
        syncRunId: true,
        mediaType: true,
        mediaId: true,
        bullJobId: true,
        correlationId: true,
        attemptCount: true
      }
    });

    for (const publication of stalePublished) {
      const terminalItemExists = await this.hasTerminalSyncItem(publication);
      if (terminalItemExists) {
        continue;
      }

      const jobLookup = await this.lookupQueueJob(publication.bullJobId);
      if (
        shouldRecoverStalePublishedTerminalFailure({
          hasSyncItem: false,
          jobLookup: jobLookup.state
        })
      ) {
        const errorMessage = resolveStalePublishedTerminalFailureMessage(
          jobLookup.failedReason
        );
        await this.catalogSyncService.recordTerminalSyncFailure({
          syncRunId: publication.syncRunId,
          mediaType: publication.mediaType,
          mediaId: publication.mediaId,
          errorMessage
        });
        await this.prisma.mediaSyncJobPublication.updateMany({
          where: buildStalePublishedPublicationCasWhere({
            publicationId: publication.id,
            staleThreshold
          }),
          data: {
            status: MediaSyncJobPublicationStatus.FAILED,
            attemptCount: { increment: 1 },
            lastError: errorMessage,
            failedAt: new Date()
          }
        });
        await this.finalizeRunIfComplete(publication.syncRunId);
        continue;
      }

      if (
        !shouldResetStalePublishedPublication({
          hasSyncItem: false,
          jobLookup: jobLookup.state
        })
      ) {
        continue;
      }

      const reset = await this.prisma.mediaSyncJobPublication.updateMany({
        where: buildStalePublishedPublicationCasWhere({
          publicationId: publication.id,
          staleThreshold
        }),
        data: {
          status: MediaSyncJobPublicationStatus.PENDING,
          attemptCount: 0,
          lastError:
            "Stale published job confirmed absent; resetting for republish"
        }
      });

      if (reset.count === 0) {
        continue;
      }

      await this.publishPublication({ ...publication, attemptCount: 0 });
      await this.finalizeRunIfComplete(publication.syncRunId);
    }
  }

  private async recoverStrandedFailedPublications(): Promise<void> {
    const failed = await this.prisma.mediaSyncJobPublication.findMany({
      where: { status: MediaSyncJobPublicationStatus.FAILED },
      orderBy: { updatedAt: "asc" },
      take: 500,
      select: {
        id: true,
        syncRunId: true,
        mediaType: true,
        mediaId: true,
        bullJobId: true,
        correlationId: true,
        attemptCount: true,
        lastError: true
      }
    });

    for (const publication of failed) {
      const terminalItemExists = await this.hasTerminalSyncItem(publication);
      if (terminalItemExists) {
        continue;
      }

      const errorMessage =
        publication.lastError ?? "Failed to publish catalog sync job";

      await this.catalogSyncService.recordTerminalSyncFailure({
        syncRunId: publication.syncRunId,
        mediaType: publication.mediaType,
        mediaId: publication.mediaId,
        errorMessage
      });
      await this.finalizeRunIfComplete(publication.syncRunId);
    }
  }

  private async processJob(
    job: Bull.Job<MediaCatalogSyncJobData>
  ): Promise<void> {
    const correlation_id = job.data.correlation_id ?? uuidv4();
    const request_id = job.data.request_id ?? null;
    const started = performance.now();
    const maxAttempts =
      typeof job.opts.attempts === "number" ? job.opts.attempts : 5;
    const attempt = job.attemptsMade + 1;

    const queueMetaBase = {
      queue_name: "mediaCatalogSyncQueue",
      job_id: String(job.id),
      job_name: "sync-media-catalog",
      attempt,
      max_attempts: maxAttempts,
      duration_ms: null as number | null,
      sync_run_id: job.data.syncRunId,
      media_type: job.data.mediaType,
      media_id: job.data.mediaId
    };

    this.logger.logQueue({
      level: "info",
      event: "queue.job.started",
      message: "Queue job started",
      correlation_id,
      request_id,
      user_id: null,
      error: null,
      meta: { ...queueMetaBase }
    });

    try {
      await this.catalogSyncService.syncMedia({
        syncRunId: job.data.syncRunId,
        mediaType: job.data.mediaType,
        mediaId: job.data.mediaId,
        correlationId: correlation_id,
        requestId: request_id,
        attempt,
        maxAttempts
      });

      const duration_ms = Math.round(performance.now() - started);
      this.logger.logQueue({
        level: "info",
        event: "queue.job.completed",
        message: "Queue job completed",
        correlation_id,
        request_id,
        user_id: null,
        error: null,
        meta: { ...queueMetaBase, duration_ms }
      });

      await this.finalizeRunIfComplete(job.data.syncRunId);
    } catch (error: unknown) {
      const duration_ms = Math.round(performance.now() - started);
      this.logger.logQueue({
        level: "error",
        event: "queue.job.failed",
        message: "Queue job failed",
        correlation_id,
        request_id,
        user_id: null,
        error: jobErrorFromUnknown(error),
        meta: { ...queueMetaBase, duration_ms }
      });

      const isFinalAttempt = attempt >= maxAttempts;
      if (isFinalAttempt) {
        await this.finalizeRunIfComplete(job.data.syncRunId);
      }

      throw error;
    }
  }

  private async recoverIncompleteRuns(): Promise<void> {
    await this.failOrphanedRunningRuns();

    const runningRuns = await this.prisma.mediaSyncRun.findMany({
      where: { status: MediaSyncRunStatus.RUNNING },
      select: { id: true }
    });

    for (const run of runningRuns) {
      await this.finalizeRunIfComplete(run.id);
    }
  }

  private async failOrphanedRunningRuns(): Promise<void> {
    const runningRuns = await this.prisma.mediaSyncRun.findMany({
      where: { status: MediaSyncRunStatus.RUNNING },
      select: {
        id: true,
        status: true,
        expectedJobCount: true,
        _count: {
          select: {
            publications: true
          }
        }
      }
    });

    const orphanedRunIds = runningRuns
      .filter((run) =>
        isOrphanedRunningSyncRun({
          status: run.status,
          expectedJobCount: run.expectedJobCount,
          publicationCount: run._count.publications
        })
      )
      .map((run) => run.id);

    if (orphanedRunIds.length === 0) {
      return;
    }

    await this.prisma.mediaSyncRun.updateMany({
      where: { id: { in: orphanedRunIds } },
      data: {
        status: MediaSyncRunStatus.FAILED,
        finishedAt: new Date(),
        errorMessage: ORPHANED_RUNNING_SYNC_RUN_ERROR_MESSAGE
      }
    });
  }
}
