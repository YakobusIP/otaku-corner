import { AuditLogService } from "@/common/audit/audit-log.service";

import {
  MediaSyncItemOutcome,
  MediaSyncMediaType,
  Prisma
} from "@prisma/client";

import { dismissOpenSyncConflictsForMediaInTransaction } from "./media-sync-dismiss.helper";

type MockTx = {
  mediaSyncItem: {
    findMany: jest.Mock;
    update: jest.Mock;
  };
  mediaSyncRun: {
    update: jest.Mock;
  };
};

describe("dismissOpenSyncConflictsForMediaInTransaction", () => {
  const openItem = {
    id: "item-1",
    syncRunId: "run-1",
    mediaType: MediaSyncMediaType.ANIME,
    mediaId: 42,
    outcome: MediaSyncItemOutcome.CONFLICT
  };

  const createTx = (): MockTx => ({
    mediaSyncItem: {
      findMany: jest.fn().mockResolvedValue([openItem]),
      update: jest.fn().mockResolvedValue(openItem)
    },
    mediaSyncRun: {
      update: jest.fn().mockResolvedValue({})
    }
  });

  const recordAudit = jest.fn().mockResolvedValue(undefined);
  const auditLogService = {
    record: recordAudit
  } as unknown as AuditLogService;

  beforeEach(() => {
    recordAudit.mockClear();
  });

  it("dismisses every open conflict and settles run counters", async () => {
    const tx = createTx();

    const dismissed = await dismissOpenSyncConflictsForMediaInTransaction(
      tx as unknown as Prisma.TransactionClient,
      auditLogService,
      {
        entityType: "anime",
        mediaId: 42,
        actorUserId: 7
      }
    );

    expect(dismissed).toBe(1);
    expect(tx.mediaSyncItem.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: {
        outcome: MediaSyncItemOutcome.RESOLVED_DISMISSED,
        conflicts: Prisma.JsonNull,
        pendingUpstream: Prisma.JsonNull,
        resolvedAt: expect.any(Date) as Date,
        resolvedByUserId: 7,
        version: { increment: 1 }
      }
    });
    expect(tx.mediaSyncRun.update).toHaveBeenCalledWith({
      where: { id: "run-1" },
      data: {
        conflictedCount: { decrement: 1 },
        unchangedCount: { increment: 1 }
      }
    });
    expect(recordAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "anime",
        entityId: 42,
        after: {
          _syncConflictDismissed: {
            outcome: MediaSyncItemOutcome.RESOLVED_DISMISSED
          }
        }
      })
    );
  });

  it("returns zero when no open conflicts exist", async () => {
    const tx = createTx();
    tx.mediaSyncItem.findMany.mockResolvedValue([]);

    const dismissed = await dismissOpenSyncConflictsForMediaInTransaction(
      tx as unknown as Prisma.TransactionClient,
      auditLogService,
      {
        entityType: "manga",
        mediaId: 99
      }
    );

    expect(dismissed).toBe(0);
    expect(tx.mediaSyncItem.update).not.toHaveBeenCalled();
    expect(tx.mediaSyncRun.update).not.toHaveBeenCalled();
    expect(recordAudit).not.toHaveBeenCalled();
  });
});
