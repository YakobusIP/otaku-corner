import {
  BadRequestException,
  ConflictException,
  NotFoundException
} from "@nestjs/common";

import { MediaSyncItemOutcome } from "@prisma/client";

import { MediaSyncResolveService } from "./media-sync-resolve.service";

jest.mock("@/media-sync/media-catalog-sync.service", () => ({
  MediaCatalogSyncService: class MediaCatalogSyncService {}
}));

jest.mock("@/media-sync/lib/media-catalog-sync-lock", () => ({
  acquireMediaCatalogSyncLock: jest.fn().mockResolvedValue(undefined)
}));

type MockPrisma = {
  mediaSyncItem: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
  mediaSyncRun: {
    update: jest.Mock;
  };
  $transaction: jest.Mock;
};

type MockCatalogSyncService = {
  applyResolutionInTransaction: jest.Mock;
  enqueueAnimeEpisodeRefreshIfNeeded: jest.Mock;
  loadLocalRecordInTransaction: jest.Mock;
  refreshOpenConflictSnapshotsAfterLocalEdit: jest.Mock;
};

describe("MediaSyncResolveService", () => {
  const conflictItem = {
    id: "item-1",
    syncRunId: "run-1",
    mediaType: "ANIME" as const,
    mediaId: 1,
    mediaTitle: "Test Anime",
    outcome: MediaSyncItemOutcome.CONFLICT,
    errorMessage: null,
    version: 3,
    conflicts: [
      {
        field: "status",
        base: "Finished",
        local: "On Hold",
        upstream: "Completed",
        rule: "divergent_change"
      },
      {
        field: "score",
        base: 8.1,
        local: 8.1,
        upstream: 8.5,
        rule: "divergent_change"
      }
    ],
    pendingUpstream: {
      status: "Completed",
      score: 8.5
    },
    baselineCatalog: { status: "Finished", score: 8.1 },
    fieldResolutions: null,
    resolvedAt: null,
    resolvedByUserId: null,
    createdAt: new Date()
  };

  const createService = (itemOverride: Record<string, unknown> = {}) => {
    const item = { ...conflictItem, ...itemOverride };
    const prisma: MockPrisma = {
      mediaSyncItem: {
        findUnique: jest.fn().mockResolvedValue(item),
        findFirst: jest.fn().mockResolvedValue(item),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest
          .fn()
          .mockImplementation(({ data }: { data: Record<string, unknown> }) =>
            Promise.resolve({
              ...item,
              ...data
            })
          )
      },
      mediaSyncRun: {
        update: jest.fn().mockResolvedValue({})
      },
      $transaction: jest.fn((callback: (tx: MockPrisma) => Promise<unknown>) =>
        Promise.resolve(callback(prisma))
      )
    };

    const catalogSyncService: MockCatalogSyncService = {
      applyResolutionInTransaction: jest.fn().mockResolvedValue({
        localRecord: { type: "TV", status: "On Hold", score: 8.1 }
      }),
      enqueueAnimeEpisodeRefreshIfNeeded: jest.fn(),
      loadLocalRecordInTransaction: jest.fn().mockResolvedValue({
        type: "TV",
        status: "On Hold",
        score: 8.1
      }),
      refreshOpenConflictSnapshotsAfterLocalEdit: jest
        .fn()
        .mockResolvedValue(undefined)
    };

    const service = new MediaSyncResolveService(
      prisma as never,
      catalogSyncService as never
    );

    return { service, prisma, catalogSyncService, item };
  };

  it("claims the conflict version before applying resolution", async () => {
    const { service, prisma, catalogSyncService } = createService();

    await service.resolveFields("item-1", {
      expectedVersion: 3,
      resolutions: [{ field: "score", choice: "accept_upstream" }]
    });

    expect(prisma.mediaSyncItem.updateMany).toHaveBeenCalledWith({
      where: {
        id: "item-1",
        outcome: MediaSyncItemOutcome.CONFLICT,
        version: 3
      },
      data: {
        version: { increment: 1 }
      }
    });
    expect(
      catalogSyncService.applyResolutionInTransaction
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        resolutionAudit: [
          expect.objectContaining({
            field: "score",
            choice: "accept_upstream"
          })
        ]
      })
    );
  });

  it("rejects expectedVersion mismatch before applying", async () => {
    const { service } = createService();

    await expect(
      service.resolveFields("item-1", {
        expectedVersion: 2,
        resolutions: [{ field: "score", choice: "keep_local" }]
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects stale conflict items when a newer open conflict exists", async () => {
    const { service, prisma } = createService();
    prisma.mediaSyncItem.findFirst.mockResolvedValueOnce({
      id: "item-newer",
      mediaType: "ANIME",
      mediaId: 1,
      outcome: MediaSyncItemOutcome.CONFLICT,
      createdAt: new Date("2026-08-30T13:00:00.000Z")
    });

    await expect(
      service.resolveFields("item-1", {
        expectedVersion: 3,
        resolutions: [{ field: "score", choice: "keep_local" }]
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects accept upstream when local changed after the conflict snapshot", async () => {
    const { service, catalogSyncService } = createService();
    catalogSyncService.loadLocalRecordInTransaction.mockResolvedValueOnce({
      type: "TV",
      status: "Watching",
      score: 8.1
    });

    await expect(
      service.resolveFields("item-1", {
        expectedVersion: 3,
        resolutions: [{ field: "status", choice: "accept_upstream" }]
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("uses current local value for keep_local resolutions", async () => {
    const { service, catalogSyncService } = createService();
    catalogSyncService.loadLocalRecordInTransaction.mockResolvedValueOnce({
      type: "TV",
      status: "Watching",
      score: 8.1
    });
    catalogSyncService.applyResolutionInTransaction.mockResolvedValueOnce({
      localRecord: { type: "TV", status: "Watching", score: 8.5 }
    });

    await service.resolveFields("item-1", {
      expectedVersion: 3,
      resolutions: [{ field: "status", choice: "keep_local" }]
    });

    expect(
      catalogSyncService.applyResolutionInTransaction
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        resolutionAudit: [
          expect.objectContaining({
            field: "status",
            choice: "keep_local",
            local: "Watching"
          })
        ]
      })
    );
  });

  it("uses post-apply local record for anime episode refresh", async () => {
    const { service, catalogSyncService } = createService({
      conflicts: [conflictItem.conflicts[1]]
    });
    catalogSyncService.applyResolutionInTransaction.mockResolvedValueOnce({
      localRecord: { type: "Movie", score: 8.5 }
    });

    await service.resolveFields("item-1", {
      expectedVersion: 3,
      resolutions: [{ field: "score", choice: "accept_upstream" }]
    });

    expect(
      catalogSyncService.enqueueAnimeEpisodeRefreshIfNeeded
    ).toHaveBeenCalledWith(
      "ANIME",
      1,
      { score: 8.5 },
      { type: "Movie", score: 8.5 }
    );
  });

  it("derives bulk accept fields from the locked transaction state", async () => {
    const { service, catalogSyncService } = createService({
      conflicts: [conflictItem.conflicts[0]],
      pendingUpstream: { status: "Completed" }
    });

    await service.acceptUpstream("item-1", { expectedVersion: 3 });

    expect(
      catalogSyncService.applyResolutionInTransaction
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        resolutionAudit: [
          expect.objectContaining({
            field: "status",
            choice: "accept_upstream"
          })
        ]
      })
    );
  });

  it("preserves field resolutions after full resolution", async () => {
    const { service } = createService({
      conflicts: [conflictItem.conflicts[0]]
    });

    const result = await service.resolveFields("item-1", {
      expectedVersion: 3,
      resolutions: [{ field: "status", choice: "keep_local" }]
    });

    expect(result.outcome).toBe(MediaSyncItemOutcome.RESOLVED_KEPT);
    expect(result.fieldResolutions).toEqual({ status: "keep_local" });
  });

  it("rejects stale version claims", async () => {
    const { service, prisma } = createService();
    prisma.mediaSyncItem.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      service.resolveFields("item-1", {
        expectedVersion: 3,
        resolutions: [{ field: "score", choice: "keep_local" }]
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("finalizes with RESOLVED_ACCEPTED when any prior field accepted upstream", async () => {
    const { service, prisma } = createService({
      conflicts: [conflictItem.conflicts[0]],
      pendingUpstream: { status: "Completed" },
      fieldResolutions: { score: "accept_upstream" }
    });

    const result = await service.resolveFields("item-1", {
      expectedVersion: 3,
      resolutions: [{ field: "status", choice: "keep_local" }]
    });

    expect(prisma.mediaSyncRun.update).toHaveBeenCalledWith({
      where: { id: "run-1" },
      data: {
        conflictedCount: { decrement: 1 },
        updatedCount: { increment: 1 }
      }
    });
    expect(result.outcome).toBe(MediaSyncItemOutcome.RESOLVED_ACCEPTED);
  });

  it("rejects unknown conflict fields", async () => {
    const { service } = createService();

    await expect(
      service.resolveFields("item-1", {
        expectedVersion: 3,
        resolutions: [{ field: "slug", choice: "keep_local" }]
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns 404 when the conflict item does not exist", async () => {
    const { service, prisma } = createService();
    prisma.mediaSyncItem.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.resolveFields("missing-item", {
        expectedVersion: 1,
        resolutions: [{ field: "score", choice: "keep_local" }]
      })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects bulk accept upstream when required null_clear fields are open", async () => {
    const { service } = createService({
      conflicts: [
        {
          field: "title",
          base: "Old",
          local: "Local title",
          upstream: null,
          rule: "null_clear"
        }
      ],
      pendingUpstream: { title: null }
    });

    await expect(
      service.acceptUpstream("item-1", { expectedVersion: 3 })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
