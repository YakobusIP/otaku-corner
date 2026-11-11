import {
  MediaSyncJobPublicationStatus,
  MediaSyncMediaType
} from "@prisma/client";

import { MediaCatalogSyncQueueService } from "./media-catalog-sync.queue";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-correlation-id")
}));

const lookupResult = (
  state: "present" | "absent" | "terminal_failed" | "unknown",
  failedReason: string | null = null
) => ({ state, failedReason });

const mockBullJob = (input: {
  id: string;
  state: string;
  attemptsMade?: number;
  maxAttempts?: number;
  failedReason?: string | null;
}) => ({
  id: input.id,
  attemptsMade: input.attemptsMade ?? 0,
  opts: { attempts: input.maxAttempts ?? 5 },
  failedReason: input.failedReason ?? null,
  getState: jest.fn().mockResolvedValue(input.state)
});

const publicationRow = {
  id: "pub-1",
  syncRunId: "run-1",
  mediaType: MediaSyncMediaType.ANIME,
  mediaId: 42,
  bullJobId: "media-catalog-sync:run-1:ANIME:42",
  correlationId: "corr-1",
  attemptCount: 0
};

type PublicationUpdateArgs = {
  where: { id: string };
  data: Record<string, unknown>;
};

const buildService = (overrides: Record<string, unknown>) => {
  const service = Object.create(
    MediaCatalogSyncQueueService.prototype
  ) as MediaCatalogSyncQueueService;

  const updateMock = jest.fn().mockResolvedValue({});
  const prisma = {
    mediaSyncJobPublication: {
      findUnique: jest.fn().mockResolvedValue({
        status: MediaSyncJobPublicationStatus.PENDING
      }),
      update: updateMock,
      upsert: jest.fn().mockResolvedValue(publicationRow)
    },
    mediaSyncItem: {
      findFirst: jest.fn().mockResolvedValue(null)
    }
  };

  const recordTerminalSyncFailure = jest.fn().mockResolvedValue({
    outcome: "FAILED",
    mediaTitle: null,
    conflicts: [],
    errorMessage: "redis unavailable"
  });
  const finalizeRunIfComplete = jest.fn().mockResolvedValue(undefined);

  Object.assign(service, {
    prisma,
    logger: { logQueue: jest.fn() },
    catalogSyncService: { recordTerminalSyncFailure },
    finalizeRunIfComplete,
    queue: {
      add: jest.fn(),
      getJob: jest.fn()
    },
    ...overrides
  });

  return {
    service,
    prisma,
    updateMock,
    recordTerminalSyncFailure,
    finalizeRunIfComplete
  };
};

const firstUpdateArgs = (updateMock: jest.Mock): PublicationUpdateArgs => {
  const call = updateMock.mock.calls[0] as [PublicationUpdateArgs] | undefined;
  if (!call) {
    throw new Error("Expected publication update call");
  }
  return call[0];
};

const firstUpdateManyArgs = <T>(updateManyMock: jest.Mock): T => {
  const call = updateManyMock.mock.calls[0] as [T] | undefined;
  if (!call) {
    throw new Error("Expected publication updateMany call");
  }
  return call[0];
};

describe("MediaCatalogSyncQueueService.enqueue", () => {
  it("marks publication published when queue.add fails but the deterministic job is confirmed present", async () => {
    const { service, updateMock, recordTerminalSyncFailure } = buildService({
      queue: {
        add: jest.fn().mockRejectedValue(new Error("redis unavailable")),
        getJob: jest.fn().mockResolvedValue(
          mockBullJob({
            id: publicationRow.bullJobId,
            state: "waiting"
          })
        )
      }
    });

    const published = await service.enqueue({
      syncRunId: "run-1",
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: 42
    });

    expect(published).toBe(true);
    expect(recordTerminalSyncFailure).not.toHaveBeenCalled();

    const publishedUpdate = firstUpdateArgs(updateMock);
    expect(publishedUpdate.where).toEqual({ id: "pub-1" });
    expect(publishedUpdate.data.status).toBe(
      MediaSyncJobPublicationStatus.PUBLISHED
    );
    expect(publishedUpdate.data.publishedAt).toBeInstanceOf(Date);
    expect(publishedUpdate.data.lastError).toBeNull();
    expect(publishedUpdate.data.attemptCount).toBe(0);
  });

  it("keeps publication pending on ambiguous enqueue failure without creating a terminal sync item", async () => {
    const { service, updateMock, recordTerminalSyncFailure } = buildService({
      queue: {
        add: jest.fn().mockRejectedValue(new Error("redis unavailable")),
        getJob: jest.fn().mockResolvedValue(null)
      }
    });

    const published = await service.enqueue({
      syncRunId: "run-1",
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: 42
    });

    expect(published).toBe(false);
    expect(recordTerminalSyncFailure).not.toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "pub-1" },
      data: {
        attemptCount: 1,
        lastError: "redis unavailable"
      }
    });
  });

  it("keeps publication pending when queue lookup fails before publish", async () => {
    const { service, updateMock, recordTerminalSyncFailure } = buildService({
      queue: {
        add: jest.fn(),
        getJob: jest.fn().mockRejectedValue(new Error("redis lookup failed"))
      }
    });

    const published = await service.enqueue({
      syncRunId: "run-1",
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: 42
    });

    expect(published).toBe(false);
    expect(recordTerminalSyncFailure).not.toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "pub-1" },
      data: {
        attemptCount: 0,
        lastError:
          "Queue job lookup failed before publish; publication remains pending"
      }
    });
  });

  it("keeps publication pending when final queue lookup is unknown after exhausted publish attempts", async () => {
    const publicationExhausted = {
      ...publicationRow,
      attemptCount: 4
    };
    const exhaustedUpdateMock = jest.fn().mockResolvedValue({});
    const { service, recordTerminalSyncFailure } = buildService({
      prisma: {
        mediaSyncJobPublication: {
          findUnique: jest.fn().mockResolvedValue({
            status: MediaSyncJobPublicationStatus.PENDING
          }),
          update: exhaustedUpdateMock,
          upsert: jest.fn().mockResolvedValue(publicationExhausted)
        },
        mediaSyncItem: {
          findFirst: jest.fn().mockResolvedValue(null)
        }
      },
      queue: {
        add: jest.fn().mockRejectedValue(new Error("redis unavailable")),
        getJob: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null)
          .mockRejectedValueOnce(new Error("redis lookup failed"))
      }
    });

    const published = await service.enqueue({
      syncRunId: "run-1",
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: 42
    });

    expect(published).toBe(false);
    expect(recordTerminalSyncFailure).not.toHaveBeenCalled();
    const pendingUpdate = firstUpdateArgs(exhaustedUpdateMock);
    expect(pendingUpdate.data.attemptCount).toBe(5);
    expect(pendingUpdate.data.lastError).toBe(
      "Queue job lookup failed after publish attempts; publication remains pending"
    );
  });

  it("abandons publication and records terminal failure only after confirmed absence", async () => {
    const publicationExhausted = {
      ...publicationRow,
      attemptCount: 4
    };
    const exhaustedUpdateMock = jest.fn().mockResolvedValue({});
    const { service, recordTerminalSyncFailure, finalizeRunIfComplete } =
      buildService({
        prisma: {
          mediaSyncJobPublication: {
            findUnique: jest.fn().mockResolvedValue({
              status: MediaSyncJobPublicationStatus.PENDING
            }),
            update: exhaustedUpdateMock,
            upsert: jest.fn().mockResolvedValue(publicationExhausted)
          },
          mediaSyncItem: {
            findFirst: jest.fn().mockResolvedValue(null)
          }
        },
        queue: {
          add: jest.fn().mockRejectedValue(new Error("redis unavailable")),
          getJob: jest.fn().mockResolvedValue(null)
        }
      });

    const published = await service.enqueue({
      syncRunId: "run-1",
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: 42
    });

    expect(published).toBe(false);
    expect(recordTerminalSyncFailure).toHaveBeenCalledWith({
      syncRunId: "run-1",
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: 42,
      errorMessage: "redis unavailable"
    });

    const failedUpdate = firstUpdateArgs(exhaustedUpdateMock);
    expect(failedUpdate.where).toEqual({ id: "pub-1" });
    expect(failedUpdate.data.status).toBe(MediaSyncJobPublicationStatus.FAILED);
    expect(failedUpdate.data.attemptCount).toEqual({ increment: 1 });
    expect(failedUpdate.data.lastError).toBe("redis unavailable");
    expect(failedUpdate.data.failedAt).toBeInstanceOf(Date);
    expect(finalizeRunIfComplete).toHaveBeenCalledWith("run-1");
    expect(recordTerminalSyncFailure.mock.invocationCallOrder[0]).toBeLessThan(
      exhaustedUpdateMock.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER
    );
  });

  it("marks publication published when a terminal sync item already exists", async () => {
    const updateMock = jest.fn().mockResolvedValue({});
    const { service, recordTerminalSyncFailure } = buildService({
      prisma: {
        mediaSyncJobPublication: {
          findUnique: jest.fn().mockResolvedValue({
            status: MediaSyncJobPublicationStatus.PENDING
          }),
          update: updateMock,
          upsert: jest.fn().mockResolvedValue(publicationRow)
        },
        mediaSyncItem: {
          findFirst: jest.fn().mockResolvedValue({ id: "item-1" })
        }
      },
      queue: {
        add: jest.fn(),
        getJob: jest.fn()
      }
    });

    const published = await service.enqueue({
      syncRunId: "run-1",
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: 42
    });

    expect(published).toBe(true);
    expect(recordTerminalSyncFailure).not.toHaveBeenCalled();
    const publishedUpdate = firstUpdateArgs(updateMock);
    expect(publishedUpdate.data.status).toBe(
      MediaSyncJobPublicationStatus.PUBLISHED
    );
    expect(publishedUpdate.data.publishedAt).toBeInstanceOf(Date);
    expect(publishedUpdate.data.lastError).toBeNull();
    expect(publishedUpdate.data.attemptCount).toBe(0);
  });

  it("resets attemptCount when publishing after prior enqueue failures", async () => {
    const publicationWithHistory = {
      ...publicationRow,
      attemptCount: 4
    };
    const updateMock = jest.fn().mockResolvedValue({});
    const { service, recordTerminalSyncFailure } = buildService({
      prisma: {
        mediaSyncJobPublication: {
          findUnique: jest.fn().mockResolvedValue({
            status: MediaSyncJobPublicationStatus.PENDING
          }),
          update: updateMock,
          upsert: jest.fn().mockResolvedValue(publicationWithHistory)
        },
        mediaSyncItem: {
          findFirst: jest.fn().mockResolvedValue(null)
        }
      },
      queue: {
        add: jest.fn().mockResolvedValue({ id: publicationRow.bullJobId }),
        getJob: jest.fn().mockResolvedValue(null)
      }
    });

    const published = await service.enqueue({
      syncRunId: "run-1",
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: 42
    });

    expect(published).toBe(true);
    expect(recordTerminalSyncFailure).not.toHaveBeenCalled();
    const publishedUpdate = firstUpdateArgs(updateMock);
    expect(publishedUpdate.data.attemptCount).toBe(0);
  });

  it("keeps publication pending when terminal failure recording fails before abandon", async () => {
    const publicationExhausted = {
      ...publicationRow,
      attemptCount: 4
    };
    const exhaustedUpdateMock = jest.fn().mockResolvedValue({});
    const recordTerminalSyncFailure = jest
      .fn()
      .mockRejectedValue(new Error("database unavailable"));

    const service = Object.create(
      MediaCatalogSyncQueueService.prototype
    ) as MediaCatalogSyncQueueService;

    Object.assign(service, {
      prisma: {
        mediaSyncJobPublication: {
          findUnique: jest.fn().mockResolvedValue({
            status: MediaSyncJobPublicationStatus.PENDING
          }),
          update: exhaustedUpdateMock,
          upsert: jest.fn().mockResolvedValue(publicationExhausted)
        },
        mediaSyncItem: {
          findFirst: jest.fn().mockResolvedValue(null)
        }
      },
      logger: { logQueue: jest.fn() },
      catalogSyncService: { recordTerminalSyncFailure },
      finalizeRunIfComplete: jest.fn(),
      queue: {
        add: jest.fn().mockRejectedValue(new Error("redis unavailable")),
        getJob: jest.fn().mockResolvedValue(null)
      }
    });

    await expect(
      service.enqueue({
        syncRunId: "run-1",
        mediaType: MediaSyncMediaType.ANIME,
        mediaId: 42
      })
    ).rejects.toThrow("database unavailable");

    expect(recordTerminalSyncFailure).toHaveBeenCalledTimes(1);
    expect(exhaustedUpdateMock).not.toHaveBeenCalled();
  });
});

describe("MediaCatalogSyncQueueService.reconcilePendingPublications", () => {
  it("skips reconciliation while another run is in flight or during shutdown", async () => {
    const service = Object.create(
      MediaCatalogSyncQueueService.prototype
    ) as MediaCatalogSyncQueueService;
    const recoverPendingPublications = jest.fn().mockResolvedValue(undefined);
    const recoverStalePublishedPublications = jest
      .fn()
      .mockResolvedValue(undefined);
    const recoverStrandedFailedPublications = jest
      .fn()
      .mockResolvedValue(undefined);

    Object.assign(service, {
      isShuttingDown: false,
      reconciliationInFlight: true,
      recoverPendingPublications,
      recoverStalePublishedPublications,
      recoverStrandedFailedPublications,
      logger: { logQueue: jest.fn() }
    });

    await service["reconcilePendingPublications"]("interval");
    expect(recoverPendingPublications).not.toHaveBeenCalled();
    expect(recoverStalePublishedPublications).not.toHaveBeenCalled();
    expect(recoverStrandedFailedPublications).not.toHaveBeenCalled();
  });

  it("reconciles pending publications when idle", async () => {
    const service = Object.create(
      MediaCatalogSyncQueueService.prototype
    ) as MediaCatalogSyncQueueService;
    const recoverPendingPublications = jest.fn().mockResolvedValue(undefined);
    const recoverStalePublishedPublications = jest
      .fn()
      .mockResolvedValue(undefined);
    const recoverStrandedFailedPublications = jest
      .fn()
      .mockResolvedValue(undefined);

    Object.assign(service, {
      isShuttingDown: false,
      reconciliationInFlight: false,
      recoverPendingPublications,
      recoverStalePublishedPublications,
      recoverStrandedFailedPublications,
      logger: { logQueue: jest.fn() }
    });

    await service["reconcilePendingPublications"]("interval");
    expect(recoverPendingPublications).toHaveBeenCalledTimes(1);
    expect(recoverStalePublishedPublications).toHaveBeenCalledTimes(1);
    expect(recoverStrandedFailedPublications).toHaveBeenCalledTimes(1);
  });
});

describe("MediaCatalogSyncQueueService.recoverStalePublishedPublications", () => {
  const stalePublishedRow = {
    id: "pub-stale",
    syncRunId: "run-1",
    mediaType: MediaSyncMediaType.ANIME,
    mediaId: 42,
    bullJobId: "media-catalog-sync:run-1:ANIME:42",
    correlationId: "corr-stale",
    attemptCount: 0
  };

  it("resets and republishes when a stale published job is confirmed absent", async () => {
    const updateManyMock = jest.fn().mockResolvedValue({ count: 1 });
    const publishPublication = jest.fn().mockResolvedValue(true);
    const finalizeRunIfComplete = jest.fn().mockResolvedValue(undefined);
    const lookupQueueJob = jest.fn().mockResolvedValue(lookupResult("absent"));

    const service = Object.create(
      MediaCatalogSyncQueueService.prototype
    ) as MediaCatalogSyncQueueService;

    Object.assign(service, {
      prisma: {
        mediaSyncJobPublication: {
          findMany: jest.fn().mockResolvedValue([stalePublishedRow]),
          updateMany: updateManyMock
        },
        mediaSyncItem: {
          findFirst: jest.fn().mockResolvedValue(null)
        }
      },
      hasTerminalSyncItem: jest.fn().mockResolvedValue(false),
      lookupQueueJob,
      publishPublication,
      finalizeRunIfComplete
    });

    await service["recoverStalePublishedPublications"]();

    const resetArgs = firstUpdateManyArgs<{
      where: {
        id: string;
        status: MediaSyncJobPublicationStatus;
        publishedAt: { lt: Date };
      };
      data: {
        status: MediaSyncJobPublicationStatus;
        lastError: string;
      };
    }>(updateManyMock);
    expect(resetArgs.where.id).toBe("pub-stale");
    expect(resetArgs.where.status).toBe(
      MediaSyncJobPublicationStatus.PUBLISHED
    );
    expect(resetArgs.where.publishedAt.lt).toBeInstanceOf(Date);
    expect(resetArgs.data).toEqual({
      status: MediaSyncJobPublicationStatus.PENDING,
      attemptCount: 0,
      lastError: "Stale published job confirmed absent; resetting for republish"
    });
    expect(publishPublication).toHaveBeenCalledWith({
      ...stalePublishedRow,
      attemptCount: 0
    });
    expect(finalizeRunIfComplete).toHaveBeenCalledWith("run-1");
  });

  it("gives stale republish a fresh attempt budget after historical enqueue failures", async () => {
    const staleRowWithHistory = {
      ...stalePublishedRow,
      attemptCount: 4
    };
    const updateManyMock = jest.fn().mockResolvedValue({ count: 1 });
    const updateMock = jest.fn().mockResolvedValue({});
    const recordTerminalSyncFailure = jest.fn().mockResolvedValue({
      outcome: "FAILED",
      mediaTitle: null,
      conflicts: [],
      errorMessage: "redis unavailable"
    });
    const finalizeRunIfComplete = jest.fn().mockResolvedValue(undefined);

    const service = Object.create(
      MediaCatalogSyncQueueService.prototype
    ) as MediaCatalogSyncQueueService;

    Object.assign(service, {
      prisma: {
        mediaSyncJobPublication: {
          findMany: jest.fn().mockResolvedValue([staleRowWithHistory]),
          findUnique: jest.fn().mockResolvedValue({
            status: MediaSyncJobPublicationStatus.PENDING
          }),
          update: updateMock,
          updateMany: updateManyMock
        },
        mediaSyncItem: {
          findFirst: jest.fn().mockResolvedValue(null)
        }
      },
      catalogSyncService: { recordTerminalSyncFailure },
      finalizeRunIfComplete,
      queue: {
        add: jest.fn().mockRejectedValue(new Error("redis unavailable")),
        getJob: jest.fn().mockResolvedValue(null)
      },
      logger: { logQueue: jest.fn() }
    });

    await service["recoverStalePublishedPublications"]();

    const resetArgs = firstUpdateManyArgs<{
      where: {
        id: string;
        status: MediaSyncJobPublicationStatus;
        publishedAt: { lt: Date };
      };
      data: {
        status: MediaSyncJobPublicationStatus;
        attemptCount: number;
        lastError: string;
      };
    }>(updateManyMock);
    expect(resetArgs.where.id).toBe("pub-stale");
    expect(resetArgs.data).toEqual({
      status: MediaSyncJobPublicationStatus.PENDING,
      attemptCount: 0,
      lastError: "Stale published job confirmed absent; resetting for republish"
    });
    expect(recordTerminalSyncFailure).not.toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "pub-stale" },
      data: {
        attemptCount: 1,
        lastError: "redis unavailable"
      }
    });
    expect(finalizeRunIfComplete).toHaveBeenCalledWith("run-1");
  });

  it("records terminal failure and finalizes when a stale published job is terminally failed", async () => {
    const updateManyMock = jest.fn().mockResolvedValue({ count: 1 });
    const publishPublication = jest.fn().mockResolvedValue(true);
    const finalizeRunIfComplete = jest.fn().mockResolvedValue(undefined);
    const recordTerminalSyncFailure = jest.fn().mockResolvedValue({
      outcome: "FAILED",
      mediaTitle: null,
      conflicts: [],
      errorMessage: "database unavailable"
    });
    const lookupQueueJob = jest
      .fn()
      .mockResolvedValue(
        lookupResult("terminal_failed", "database unavailable")
      );

    const service = Object.create(
      MediaCatalogSyncQueueService.prototype
    ) as MediaCatalogSyncQueueService;

    Object.assign(service, {
      prisma: {
        mediaSyncJobPublication: {
          findMany: jest.fn().mockResolvedValue([stalePublishedRow]),
          updateMany: updateManyMock
        },
        mediaSyncItem: {
          findFirst: jest.fn().mockResolvedValue(null)
        }
      },
      catalogSyncService: { recordTerminalSyncFailure },
      hasTerminalSyncItem: jest.fn().mockResolvedValue(false),
      lookupQueueJob,
      publishPublication,
      finalizeRunIfComplete
    });

    await service["recoverStalePublishedPublications"]();

    expect(recordTerminalSyncFailure).toHaveBeenCalledWith({
      syncRunId: "run-1",
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: 42,
      errorMessage: "database unavailable"
    });
    const failedArgs = firstUpdateManyArgs<{
      where: {
        id: string;
        status: MediaSyncJobPublicationStatus;
        publishedAt: { lt: Date };
      };
      data: {
        status: MediaSyncJobPublicationStatus;
        attemptCount: { increment: number };
        lastError: string;
        failedAt: Date;
      };
    }>(updateManyMock);
    expect(failedArgs.where.id).toBe("pub-stale");
    expect(failedArgs.where.status).toBe(
      MediaSyncJobPublicationStatus.PUBLISHED
    );
    expect(failedArgs.where.publishedAt.lt).toBeInstanceOf(Date);
    expect(failedArgs.data.status).toBe(MediaSyncJobPublicationStatus.FAILED);
    expect(failedArgs.data.attemptCount).toEqual({ increment: 1 });
    expect(failedArgs.data.lastError).toBe("database unavailable");
    expect(failedArgs.data.failedAt).toBeInstanceOf(Date);
    expect(publishPublication).not.toHaveBeenCalled();
    expect(finalizeRunIfComplete).toHaveBeenCalledWith("run-1");
  });

  it("does not reset when the queue job is present or lookup is unknown", async () => {
    const updateManyMock = jest.fn().mockResolvedValue({ count: 1 });
    const publishPublication = jest.fn().mockResolvedValue(true);
    const finalizeRunIfComplete = jest.fn().mockResolvedValue(undefined);

    for (const jobLookup of [
      lookupResult("present"),
      lookupResult("unknown")
    ] as const) {
      updateManyMock.mockClear();
      publishPublication.mockClear();
      finalizeRunIfComplete.mockClear();

      const service = Object.create(
        MediaCatalogSyncQueueService.prototype
      ) as MediaCatalogSyncQueueService;

      Object.assign(service, {
        prisma: {
          mediaSyncJobPublication: {
            findMany: jest.fn().mockResolvedValue([stalePublishedRow]),
            updateMany: updateManyMock
          }
        },
        hasTerminalSyncItem: jest.fn().mockResolvedValue(false),
        lookupQueueJob: jest.fn().mockResolvedValue(jobLookup),
        publishPublication,
        finalizeRunIfComplete
      });

      await service["recoverStalePublishedPublications"]();

      expect(updateManyMock).not.toHaveBeenCalled();
      expect(publishPublication).not.toHaveBeenCalled();
      expect(finalizeRunIfComplete).not.toHaveBeenCalled();
    }
  });

  it("does not reset when a terminal sync item already exists", async () => {
    const updateManyMock = jest.fn().mockResolvedValue({ count: 1 });
    const publishPublication = jest.fn().mockResolvedValue(true);
    const finalizeRunIfComplete = jest.fn().mockResolvedValue(undefined);

    const service = Object.create(
      MediaCatalogSyncQueueService.prototype
    ) as MediaCatalogSyncQueueService;

    Object.assign(service, {
      prisma: {
        mediaSyncJobPublication: {
          findMany: jest.fn().mockResolvedValue([stalePublishedRow]),
          updateMany: updateManyMock
        }
      },
      hasTerminalSyncItem: jest.fn().mockResolvedValue(true),
      lookupQueueJob: jest.fn().mockResolvedValue(lookupResult("absent")),
      publishPublication,
      finalizeRunIfComplete
    });

    await service["recoverStalePublishedPublications"]();

    expect(updateManyMock).not.toHaveBeenCalled();
    expect(publishPublication).not.toHaveBeenCalled();
    expect(finalizeRunIfComplete).not.toHaveBeenCalled();
  });
});

describe("MediaCatalogSyncQueueService.recoverStrandedFailedPublications", () => {
  it("records terminal failure for failed publications without a sync item", async () => {
    const service = Object.create(
      MediaCatalogSyncQueueService.prototype
    ) as MediaCatalogSyncQueueService;
    const recordTerminalSyncFailure = jest.fn().mockResolvedValue({
      outcome: "FAILED",
      mediaTitle: null,
      conflicts: [],
      errorMessage: "redis unavailable"
    });
    const finalizeRunIfComplete = jest.fn().mockResolvedValue(undefined);

    Object.assign(service, {
      prisma: {
        mediaSyncJobPublication: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: "pub-1",
              syncRunId: "run-1",
              mediaType: MediaSyncMediaType.ANIME,
              mediaId: 42,
              bullJobId: "media-catalog-sync:run-1:ANIME:42",
              correlationId: "corr-1",
              attemptCount: 5,
              lastError: "redis unavailable"
            }
          ])
        },
        mediaSyncItem: {
          findFirst: jest.fn().mockResolvedValue(null)
        }
      },
      catalogSyncService: { recordTerminalSyncFailure },
      finalizeRunIfComplete
    });

    await service["recoverStrandedFailedPublications"]();

    expect(recordTerminalSyncFailure).toHaveBeenCalledWith({
      syncRunId: "run-1",
      mediaType: MediaSyncMediaType.ANIME,
      mediaId: 42,
      errorMessage: "redis unavailable"
    });
    expect(finalizeRunIfComplete).toHaveBeenCalledWith("run-1");
  });
});
