import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { BullQueueService } from "@/common/bull/bull-queue.service";
import { jobErrorFromUnknown } from "@/common/bull/external-metadata-queue";
import {
  logQueueJobEnqueueFailed,
  logQueueJobEnqueued
} from "@/common/bull/queue-infrastructure-logging";
import {
  type RequestLogContextStore,
  getRequestLogContext
} from "@/common/logging/request-log-context";
import { StructuredLogger } from "@/common/logging/structured-logger.service";
import { computeRoundedWeightedPersonalScore } from "@/common/review-personal-score";

import { PrismaService } from "@/prisma/prisma.service";

import type { ReviewPersonalScoreWeightsMediaType } from "@/settings/setting-keys";

import type Bull from "bull";
import { v4 as uuidv4 } from "uuid";

const QUEUE_NAME = "recalculatePersonalScoresQueue";
const JOB_NAME = "recalculate-personal-scores";
const BATCH_SIZE = 200;

type RecalculatePersonalScoresJobData = {
  mediaType: ReviewPersonalScoreWeightsMediaType;
  weights: Record<string, number>;
  correlation_id?: string;
  request_id?: string | null;
};

@Injectable()
export class RecalculatePersonalScoresQueueService
  implements OnModuleInit, OnModuleDestroy
{
  private queue!: Bull.Queue<RecalculatePersonalScoresJobData>;

  constructor(
    private readonly bullQueue: BullQueueService,
    private readonly prisma: PrismaService,
    private readonly logger: StructuredLogger
  ) {}

  onModuleInit(): void {
    const queue = this.bullQueue.createQueue<RecalculatePersonalScoresJobData>(
      QUEUE_NAME,
      {
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000
          },
          removeOnComplete: 20,
          removeOnFail: 50
        }
      }
    );

    this.queue = queue;
    void queue.process((job) => this.processJob(job));
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }

  enqueue(
    mediaType: ReviewPersonalScoreWeightsMediaType,
    weights: Record<string, number>,
    requestLog?: RequestLogContextStore
  ): void {
    const als = getRequestLogContext();
    const correlation_id =
      requestLog?.correlation_id ?? als?.correlation_id ?? uuidv4();
    const request_id = requestLog?.request_id ?? als?.request_id ?? null;

    void this.queue
      .add({
        mediaType,
        weights,
        correlation_id,
        request_id: request_id ?? null
      })
      .then((job) => {
        logQueueJobEnqueued(this.logger, {
          queue_name: QUEUE_NAME,
          job_id: String(job.id),
          job_name: JOB_NAME,
          correlation_id,
          request_id,
          meta: {
            media_type: mediaType
          }
        });
      })
      .catch((error: unknown) => {
        logQueueJobEnqueueFailed(this.logger, {
          queue_name: QUEUE_NAME,
          job_name: JOB_NAME,
          correlation_id,
          request_id,
          error,
          meta: {
            media_type: mediaType
          }
        });
      });
  }

  private async processJob(
    job: Bull.Job<RecalculatePersonalScoresJobData>
  ): Promise<void> {
    const correlation_id =
      job.data.correlation_id ??
      getRequestLogContext()?.correlation_id ??
      uuidv4();
    const request_id = job.data.request_id ?? null;
    const started = performance.now();
    const maxAttempts =
      typeof job.opts.attempts === "number" ? job.opts.attempts : 3;

    const queueMetaBase = {
      queue_name: QUEUE_NAME,
      job_id: String(job.id),
      job_name: JOB_NAME,
      attempt: job.attemptsMade + 1,
      max_attempts: maxAttempts,
      duration_ms: null as number | null,
      media_type: job.data.mediaType
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
      const { updatedCount, skippedCount } = await this.recalculateMediaType(
        job.data.mediaType,
        job.data.weights
      );

      const duration_ms = Math.round(performance.now() - started);

      this.logger.logQueue({
        level: "info",
        event: "queue.job.completed",
        message: "Queue job completed",
        correlation_id,
        request_id,
        user_id: null,
        error: null,
        meta: {
          ...queueMetaBase,
          duration_ms,
          reviews_updated: updatedCount,
          reviews_skipped: skippedCount
        }
      });
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
        meta: {
          ...queueMetaBase,
          duration_ms
        }
      });

      throw error;
    }
  }

  private async recalculateMediaType(
    mediaType: ReviewPersonalScoreWeightsMediaType,
    weights: Record<string, number>
  ): Promise<{ updatedCount: number; skippedCount: number }> {
    switch (mediaType) {
      case "anime":
        return this.recalculateAnimeReviews(weights);
      case "manga":
        return this.recalculateMangaReviews(weights);
      case "lightNovel":
        return this.recalculateLightNovelReviews(weights);
    }
  }

  private async recalculateAnimeReviews(
    weights: Record<string, number>
  ): Promise<{ updatedCount: number; skippedCount: number }> {
    let cursor: number | undefined;
    let updatedCount = 0;
    let skippedCount = 0;

    for (;;) {
      const reviews = await this.prisma.animeReview.findMany({
        take: BATCH_SIZE,
        ...(cursor
          ? {
              skip: 1,
              cursor: { id: cursor }
            }
          : {}),
        orderBy: { id: "asc" },
        select: {
          id: true,
          storylineRating: true,
          qualityRating: true,
          voiceActingRating: true,
          soundTrackRating: true,
          charDevelopmentRating: true,
          personalScore: true
        }
      });

      if (reviews.length === 0) {
        break;
      }

      for (const review of reviews) {
        const personalScore = computeRoundedWeightedPersonalScore(
          {
            storylineRating: review.storylineRating,
            qualityRating: review.qualityRating,
            voiceActingRating: review.voiceActingRating,
            soundTrackRating: review.soundTrackRating,
            charDevelopmentRating: review.charDevelopmentRating
          },
          weights
        );

        if (personalScore === null || review.personalScore === personalScore) {
          skippedCount += 1;
          continue;
        }

        await this.prisma.animeReview.update({
          where: { id: review.id },
          data: { personalScore }
        });
        updatedCount += 1;
      }

      cursor = reviews[reviews.length - 1]?.id;
      if (reviews.length < BATCH_SIZE) {
        break;
      }
    }

    return { updatedCount, skippedCount };
  }

  private async recalculateMangaReviews(
    weights: Record<string, number>
  ): Promise<{ updatedCount: number; skippedCount: number }> {
    let cursor: number | undefined;
    let updatedCount = 0;
    let skippedCount = 0;

    for (;;) {
      const reviews = await this.prisma.mangaReview.findMany({
        take: BATCH_SIZE,
        ...(cursor
          ? {
              skip: 1,
              cursor: { id: cursor }
            }
          : {}),
        orderBy: { id: "asc" },
        select: {
          id: true,
          storylineRating: true,
          artStyleRating: true,
          charDevelopmentRating: true,
          worldBuildingRating: true,
          originalityRating: true,
          personalScore: true
        }
      });

      if (reviews.length === 0) {
        break;
      }

      for (const review of reviews) {
        const personalScore = computeRoundedWeightedPersonalScore(
          {
            storylineRating: review.storylineRating,
            artStyleRating: review.artStyleRating,
            charDevelopmentRating: review.charDevelopmentRating,
            worldBuildingRating: review.worldBuildingRating,
            originalityRating: review.originalityRating
          },
          weights
        );

        if (personalScore === null || review.personalScore === personalScore) {
          skippedCount += 1;
          continue;
        }

        await this.prisma.mangaReview.update({
          where: { id: review.id },
          data: { personalScore }
        });
        updatedCount += 1;
      }

      cursor = reviews[reviews.length - 1]?.id;
      if (reviews.length < BATCH_SIZE) {
        break;
      }
    }

    return { updatedCount, skippedCount };
  }

  private async recalculateLightNovelReviews(
    weights: Record<string, number>
  ): Promise<{ updatedCount: number; skippedCount: number }> {
    let cursor: number | undefined;
    let updatedCount = 0;
    let skippedCount = 0;

    for (;;) {
      const reviews = await this.prisma.lightNovelReview.findMany({
        take: BATCH_SIZE,
        ...(cursor
          ? {
              skip: 1,
              cursor: { id: cursor }
            }
          : {}),
        orderBy: { id: "asc" },
        select: {
          id: true,
          storylineRating: true,
          worldBuildingRating: true,
          writingStyleRating: true,
          charDevelopmentRating: true,
          originalityRating: true,
          personalScore: true
        }
      });

      if (reviews.length === 0) {
        break;
      }

      for (const review of reviews) {
        const personalScore = computeRoundedWeightedPersonalScore(
          {
            storylineRating: review.storylineRating,
            worldBuildingRating: review.worldBuildingRating,
            writingStyleRating: review.writingStyleRating,
            charDevelopmentRating: review.charDevelopmentRating,
            originalityRating: review.originalityRating
          },
          weights
        );

        if (personalScore === null || review.personalScore === personalScore) {
          skippedCount += 1;
          continue;
        }

        await this.prisma.lightNovelReview.update({
          where: { id: review.id },
          data: { personalScore }
        });
        updatedCount += 1;
      }

      cursor = reviews[reviews.length - 1]?.id;
      if (reviews.length < BATCH_SIZE) {
        break;
      }
    }

    return { updatedCount, skippedCount };
  }
}
