import { MediaSyncItemOutcome } from "@prisma/client";

import { MediaSyncQueryService } from "./media-sync-query.service";

describe("MediaSyncQueryService", () => {
  it("lists open conflicts across runs with pagination metadata", async () => {
    const row = {
      id: "item-1",
      syncRunId: "run-1",
      mediaType: "ANIME" as const,
      mediaId: 1,
      mediaTitle: "Test",
      outcome: MediaSyncItemOutcome.CONFLICT,
      errorMessage: null,
      conflicts: [],
      pendingUpstream: null,
      baselineCatalog: { synopsis: "Base" },
      fieldResolutions: null,
      version: 2,
      resolvedAt: null,
      resolvedByUserId: null,
      createdAt: new Date()
    };

    const prisma = {
      mediaSyncItem: {
        findMany: jest.fn().mockResolvedValue([row]),
        count: jest.fn().mockResolvedValue(1)
      }
    };

    const service = new MediaSyncQueryService(prisma as never);
    const result = await service.findOpenConflicts({ page: 1, limit: 20 });

    expect(prisma.mediaSyncItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { outcome: MediaSyncItemOutcome.CONFLICT }
      })
    );
    expect(result.total).toBe(1);
    expect(result.data[0]?.syncRunId).toBe("run-1");
    expect(result.data[0]?.isLegacyUntrusted).toBe(false);
  });
});
