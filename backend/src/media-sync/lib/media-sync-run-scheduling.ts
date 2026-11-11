import { buildMediaCatalogSyncJobId } from "@/media-sync/lib/media-catalog-sync-publication";

import {
  MediaSyncJobPublicationStatus,
  MediaSyncMediaType,
  MediaSyncRunStatus,
  MediaSyncRunType,
  Prisma
} from "@prisma/client";
import { randomUUID } from "crypto";

export type MediaSyncPublicationTarget = {
  syncRunId: string;
  mediaType: MediaSyncMediaType;
  mediaId: number;
};

export type ScheduledSyncRunWrite = {
  run: {
    id: string;
    type: MediaSyncRunType;
    status: MediaSyncRunStatus;
    expectedJobCount: number;
    startedAt: Date;
    finishedAt?: Date;
  };
  publications: Prisma.MediaSyncJobPublicationCreateManyInput[];
};

export const createMediaSyncRunId = (): string => randomUUID();

export const buildMediaSyncPublicationTargets = (
  syncRunId: string,
  jobs: {
    animeIds: readonly { id: number }[];
    mangaIds: readonly { id: number }[];
    lightNovelIds: readonly { id: number }[];
  }
): MediaSyncPublicationTarget[] => [
  ...jobs.animeIds.map((row) => ({
    syncRunId,
    mediaType: MediaSyncMediaType.ANIME,
    mediaId: row.id
  })),
  ...jobs.mangaIds.map((row) => ({
    syncRunId,
    mediaType: MediaSyncMediaType.MANGA,
    mediaId: row.id
  })),
  ...jobs.lightNovelIds.map((row) => ({
    syncRunId,
    mediaType: MediaSyncMediaType.LIGHT_NOVEL,
    mediaId: row.id
  }))
];

export const buildScheduledSyncRunWrite = (input: {
  runId: string;
  type: MediaSyncRunType;
  jobs: readonly MediaSyncPublicationTarget[];
}): ScheduledSyncRunWrite => {
  const expectedJobCount = input.jobs.length;
  const startedAt = new Date();

  if (expectedJobCount === 0) {
    return {
      run: {
        id: input.runId,
        type: input.type,
        status: MediaSyncRunStatus.COMPLETED,
        expectedJobCount: 0,
        startedAt,
        finishedAt: startedAt
      },
      publications: []
    };
  }

  return {
    run: {
      id: input.runId,
      type: input.type,
      status: MediaSyncRunStatus.RUNNING,
      expectedJobCount,
      startedAt
    },
    publications: input.jobs.map((job) => ({
      syncRunId: job.syncRunId,
      mediaType: job.mediaType,
      mediaId: job.mediaId,
      bullJobId: buildMediaCatalogSyncJobId(job),
      correlationId: randomUUID(),
      status: MediaSyncJobPublicationStatus.PENDING
    }))
  };
};

export const isOrphanedRunningSyncRun = (run: {
  status: MediaSyncRunStatus;
  expectedJobCount: number | null;
  publicationCount: number;
}): boolean => {
  if (run.status !== MediaSyncRunStatus.RUNNING) {
    return false;
  }

  // Legacy runs predate the publication outbox and keep expectedJobCount null.
  // In-flight jobs from the prior app version must not be abandoned on deploy.
  if (run.expectedJobCount === null) {
    return false;
  }

  return run.expectedJobCount > 0 && run.publicationCount === 0;
};

export const ORPHANED_RUNNING_SYNC_RUN_ERROR_MESSAGE =
  "Sync run scheduling did not complete before recovery";
