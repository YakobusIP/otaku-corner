import { Injectable } from "@nestjs/common";

import { notDeletedMediaWhere } from "@/common/media/not-deleted-media-where";

import { PrismaService } from "@/prisma/prisma.service";

import {
  buildMediaSyncPublicationTargets,
  buildScheduledSyncRunWrite,
  createMediaSyncRunId
} from "@/media-sync/lib/media-sync-run-scheduling";
import { MediaCatalogSyncQueueService } from "@/media-sync/media-catalog-sync.queue";

import { MediaSyncMediaType, MediaSyncRunType } from "@prisma/client";

@Injectable()
export class MediaSyncOrchestratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogSyncQueue: MediaCatalogSyncQueueService
  ) {}

  async startRun(type: MediaSyncRunType): Promise<string> {
    const [animeIds, mangaIds, lightNovelIds] = await Promise.all([
      this.prisma.anime.findMany({
        where: notDeletedMediaWhere,
        select: { id: true }
      }),
      this.prisma.manga.findMany({
        where: notDeletedMediaWhere,
        select: { id: true }
      }),
      this.prisma.lightNovel.findMany({
        where: notDeletedMediaWhere,
        select: { id: true }
      })
    ]);

    const runId = createMediaSyncRunId();
    const jobs = buildMediaSyncPublicationTargets(runId, {
      animeIds,
      mangaIds,
      lightNovelIds
    });
    const scheduledWrite = buildScheduledSyncRunWrite({
      runId,
      type,
      jobs
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.mediaSyncRun.create({
        data: scheduledWrite.run
      });

      if (scheduledWrite.publications.length > 0) {
        await tx.mediaSyncJobPublication.createMany({
          data: scheduledWrite.publications
        });
      }
    });

    if (scheduledWrite.publications.length === 0) {
      return runId;
    }

    await Promise.all(jobs.map((job) => this.catalogSyncQueue.enqueue(job)));
    await this.catalogSyncQueue.finalizeRunIfComplete(runId);

    return runId;
  }

  async startSingleMediaRun(
    mediaType: MediaSyncMediaType,
    mediaId: number
  ): Promise<string> {
    const runId = createMediaSyncRunId();
    const jobs = [{ syncRunId: runId, mediaType, mediaId }];
    const scheduledWrite = buildScheduledSyncRunWrite({
      runId,
      type: MediaSyncRunType.MANUAL,
      jobs
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.mediaSyncRun.create({
        data: scheduledWrite.run
      });
      await tx.mediaSyncJobPublication.createMany({
        data: scheduledWrite.publications
      });
    });

    await this.catalogSyncQueue.enqueue({
      syncRunId: runId,
      mediaType,
      mediaId
    });
    await this.catalogSyncQueue.finalizeRunIfComplete(runId);

    return runId;
  }
}
