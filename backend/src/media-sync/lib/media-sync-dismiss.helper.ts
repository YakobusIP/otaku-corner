import { AuditLogService } from "@/common/audit/audit-log.service";

import {
  AuditAction,
  AuditSource,
  MediaSyncItemOutcome,
  MediaSyncMediaType,
  Prisma
} from "@prisma/client";

const ENTITY_TYPE_TO_MEDIA_SYNC_TYPE = {
  anime: MediaSyncMediaType.ANIME,
  manga: MediaSyncMediaType.MANGA,
  lightNovel: MediaSyncMediaType.LIGHT_NOVEL
} as const;

export type MediaLifecycleEntityType =
  keyof typeof ENTITY_TYPE_TO_MEDIA_SYNC_TYPE;

export const toMediaSyncMediaType = (
  entityType: MediaLifecycleEntityType
): MediaSyncMediaType => ENTITY_TYPE_TO_MEDIA_SYNC_TYPE[entityType];

/** Dismisses every open sync conflict for one media row inside the caller transaction. */
export const dismissOpenSyncConflictsForMediaInTransaction = async (
  tx: Prisma.TransactionClient,
  auditLogService: AuditLogService,
  params: {
    entityType: MediaLifecycleEntityType;
    mediaId: number;
    actorUserId?: number | null;
  }
): Promise<number> => {
  const mediaType = toMediaSyncMediaType(params.entityType);
  const openItems = await tx.mediaSyncItem.findMany({
    where: {
      mediaType,
      mediaId: params.mediaId,
      outcome: MediaSyncItemOutcome.CONFLICT
    }
  });

  for (const item of openItems) {
    await tx.mediaSyncItem.update({
      where: { id: item.id },
      data: {
        outcome: MediaSyncItemOutcome.RESOLVED_DISMISSED,
        conflicts: Prisma.JsonNull,
        pendingUpstream: Prisma.JsonNull,
        resolvedAt: new Date(),
        resolvedByUserId: params.actorUserId ?? null,
        version: { increment: 1 }
      }
    });

    await tx.mediaSyncRun.update({
      where: { id: item.syncRunId },
      data: {
        conflictedCount: { decrement: 1 },
        unchangedCount: { increment: 1 }
      }
    });

    await auditLogService.record({
      action: AuditAction.UPDATE,
      source: AuditSource.ADMIN,
      entityType: params.entityType,
      entityId: params.mediaId,
      before: {
        _syncConflictDismissed: {
          itemId: item.id,
          syncRunId: item.syncRunId,
          reason: "media_deleted"
        }
      },
      after: {
        _syncConflictDismissed: {
          outcome: MediaSyncItemOutcome.RESOLVED_DISMISSED
        }
      },
      actorUserId: params.actorUserId ?? null,
      tx
    });
  }

  return openItems.length;
};
