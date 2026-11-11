import { MediaSyncRunStatus, MediaSyncRunType } from "@prisma/client";

import {
  buildMediaSyncPublicationTargets,
  buildScheduledSyncRunWrite,
  isOrphanedRunningSyncRun
} from "./media-sync-run-scheduling";

describe("media-sync-run-scheduling", () => {
  it("builds a complete publication target set for a run", () => {
    const runId = "run-1";
    const jobs = buildMediaSyncPublicationTargets(runId, {
      animeIds: [{ id: 1 }],
      mangaIds: [{ id: 2 }],
      lightNovelIds: [{ id: 3 }]
    });

    expect(jobs).toEqual([
      { syncRunId: runId, mediaType: "ANIME", mediaId: 1 },
      { syncRunId: runId, mediaType: "MANGA", mediaId: 2 },
      { syncRunId: runId, mediaType: "LIGHT_NOVEL", mediaId: 3 }
    ]);
  });

  it("commits run metadata and the full publication outbox in one atomic write payload", () => {
    const runId = "run-1";
    const jobs = buildMediaSyncPublicationTargets(runId, {
      animeIds: [{ id: 10 }],
      mangaIds: [],
      lightNovelIds: []
    });
    const scheduled = buildScheduledSyncRunWrite({
      runId,
      type: MediaSyncRunType.SCHEDULED,
      jobs
    });

    expect(scheduled.run).toMatchObject({
      id: runId,
      type: MediaSyncRunType.SCHEDULED,
      status: MediaSyncRunStatus.RUNNING,
      expectedJobCount: 1
    });
    expect(scheduled.publications).toHaveLength(1);
    expect(scheduled.publications[0]).toMatchObject({
      syncRunId: runId,
      mediaType: "ANIME",
      mediaId: 10,
      bullJobId: "media-catalog-sync:run-1:ANIME:10",
      status: "PENDING"
    });
  });

  it("marks zero-job runs completed in the same atomic write payload", () => {
    const scheduled = buildScheduledSyncRunWrite({
      runId: "run-empty",
      type: MediaSyncRunType.SCHEDULED,
      jobs: []
    });

    expect(scheduled.run).toMatchObject({
      id: "run-empty",
      status: MediaSyncRunStatus.COMPLETED,
      expectedJobCount: 0
    });
    expect(scheduled.run.finishedAt).toBeInstanceOf(Date);
    expect(scheduled.publications).toEqual([]);
  });

  it("does not abandon legacy running runs during rolling deployment", () => {
    expect(
      isOrphanedRunningSyncRun({
        status: MediaSyncRunStatus.RUNNING,
        expectedJobCount: null,
        publicationCount: 0
      })
    ).toBe(false);
    expect(
      isOrphanedRunningSyncRun({
        status: MediaSyncRunStatus.RUNNING,
        expectedJobCount: null,
        publicationCount: 5
      })
    ).toBe(false);
  });

  it("detects orphaned current-format runs from incomplete scheduling", () => {
    expect(
      isOrphanedRunningSyncRun({
        status: MediaSyncRunStatus.RUNNING,
        expectedJobCount: 3,
        publicationCount: 0
      })
    ).toBe(true);
    expect(
      isOrphanedRunningSyncRun({
        status: MediaSyncRunStatus.RUNNING,
        expectedJobCount: 3,
        publicationCount: 3
      })
    ).toBe(false);
    expect(
      isOrphanedRunningSyncRun({
        status: MediaSyncRunStatus.RUNNING,
        expectedJobCount: 0,
        publicationCount: 0
      })
    ).toBe(false);
  });
});
