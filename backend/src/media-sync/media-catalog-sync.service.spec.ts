import { MediaSyncItemOutcome, MediaSyncMediaType } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { MediaCatalogSyncService } from "./media-catalog-sync.service";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-correlation-id")
}));

jest.mock("@/anime/fetch-episodes.queue", () => ({
  FetchEpisodesQueueService: class FetchEpisodesQueueService {}
}));

jest.mock("@/media-sync/lib/media-catalog-sync-lock", () => ({
  acquireMediaCatalogSyncLock: jest.fn().mockResolvedValue(undefined)
}));

type MockTx = {
  mediaSyncItem: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  mediaSyncRun: {
    update: jest.Mock;
  };
};

const buildService = () => {
  const service = Object.create(
    MediaCatalogSyncService.prototype
  ) as MediaCatalogSyncService;

  const tx: MockTx = {
    mediaSyncItem: {
      findUnique: jest.fn(),
      create: jest.fn()
    },
    mediaSyncRun: {
      update: jest.fn().mockResolvedValue({})
    }
  };

  const prisma = {
    $transaction: jest.fn((callback: (client: MockTx) => unknown) =>
      Promise.resolve(callback(tx))
    ),
    mediaSyncItem: {
      findUnique: jest.fn()
    }
  };

  Object.assign(service, { prisma });

  return { service, tx, prisma };
};

const failureParams = {
  syncRunId: "run-1",
  mediaType: MediaSyncMediaType.ANIME,
  mediaId: 42,
  mediaTitle: "Test Anime",
  errorMessage: "Invalid Tenrai catalog payload"
};

describe("MediaCatalogSyncService.recordTerminalSyncFailure", () => {
  it("creates a failed sync item and increments run counters on first attempt", async () => {
    const { service, tx } = buildService();
    tx.mediaSyncItem.findUnique.mockResolvedValue(null);
    tx.mediaSyncItem.create.mockResolvedValue({ id: "item-1" });

    const result = await service.recordTerminalSyncFailure(failureParams);

    expect(result).toEqual({
      outcome: MediaSyncItemOutcome.FAILED,
      mediaTitle: "Test Anime",
      conflicts: [],
      errorMessage: "Invalid Tenrai catalog payload"
    });
    expect(tx.mediaSyncItem.create).toHaveBeenCalledTimes(1);
    expect(tx.mediaSyncRun.update).toHaveBeenCalledWith({
      where: { id: "run-1" },
      data: {
        touchedCount: { increment: 1 },
        failedCount: { increment: 1 }
      }
    });
  });

  it("returns the existing outcome without creating or incrementing on retry", async () => {
    const { service, tx } = buildService();
    tx.mediaSyncItem.findUnique.mockResolvedValue({
      outcome: MediaSyncItemOutcome.FAILED,
      mediaTitle: "Test Anime",
      conflicts: null,
      errorMessage: "Invalid Tenrai catalog payload"
    });

    const result = await service.recordTerminalSyncFailure(failureParams);

    expect(result.outcome).toBe(MediaSyncItemOutcome.FAILED);
    expect(tx.mediaSyncItem.create).not.toHaveBeenCalled();
    expect(tx.mediaSyncRun.update).not.toHaveBeenCalled();
  });

  it("treats a per-run unique violation as a no-op and returns the persisted row", async () => {
    const { service, tx, prisma } = buildService();
    const uniqueViolation = new PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "test",
        meta: {
          target: ["syncRunId", "mediaType", "mediaId"]
        }
      }
    );

    tx.mediaSyncItem.findUnique.mockResolvedValueOnce(null);
    tx.mediaSyncItem.create.mockRejectedValue(uniqueViolation);
    prisma.mediaSyncItem.findUnique.mockResolvedValue({
      outcome: MediaSyncItemOutcome.FAILED,
      mediaTitle: "Test Anime",
      conflicts: null,
      errorMessage: "Invalid Tenrai catalog payload"
    });

    const result = await service.recordTerminalSyncFailure(failureParams);

    expect(result.outcome).toBe(MediaSyncItemOutcome.FAILED);
    expect(tx.mediaSyncItem.create).toHaveBeenCalledTimes(1);
    expect(tx.mediaSyncRun.update).not.toHaveBeenCalled();
    expect(prisma.mediaSyncItem.findUnique).toHaveBeenCalledTimes(1);
    expect(tx.mediaSyncItem.findUnique).toHaveBeenCalledTimes(1);
  });
});
