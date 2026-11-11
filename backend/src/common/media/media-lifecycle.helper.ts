import { NotFoundException } from "@nestjs/common";

import { buildAuditFieldDiff } from "@/common/audit/audit-diff";
import { AuditLogService } from "@/common/audit/audit-log.service";
import { notDeletedMediaWhere } from "@/common/media/not-deleted-media-where";

import { PrismaService } from "@/prisma/prisma.service";

import { acquireMediaCatalogSyncLock } from "@/media-sync/lib/media-catalog-sync-lock";
import {
  dismissOpenSyncConflictsForMediaInTransaction,
  toMediaSyncMediaType
} from "@/media-sync/lib/media-sync-dismiss.helper";

import { AuditAction, AuditSource, Prisma } from "@prisma/client";

const CATALOG_AUDIT_FIELDS = {
  anime: [
    "type",
    "status",
    "rating",
    "season",
    "title",
    "titleJapanese",
    "titleSynonyms",
    "source",
    "aired",
    "broadcast",
    "episodesCount",
    "duration",
    "score",
    "images",
    "synopsis",
    "trailer",
    "malUrl"
  ],
  manga: [
    "status",
    "title",
    "titleJapanese",
    "titleSynonyms",
    "published",
    "chaptersCount",
    "volumesCount",
    "score",
    "images",
    "synopsis",
    "malUrl"
  ],
  lightNovel: [
    "status",
    "title",
    "titleJapanese",
    "titleSynonyms",
    "published",
    "volumesCount",
    "score",
    "images",
    "synopsis",
    "malUrl"
  ]
} as const;

export const softDeleteMedia = async (
  prisma: PrismaService,
  entityType: "anime" | "manga" | "lightNovel",
  ids: number[],
  auditLogService: AuditLogService,
  actorUserId?: number | null
): Promise<void> => {
  if (ids.length === 0) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const id of ids) {
      const existing = await findActiveMedia(tx, entityType, id);
      if (!existing) {
        throw new NotFoundException(`${entityType} not found`);
      }

      await updateMediaDeletedAt(tx, entityType, id, new Date());

      await acquireMediaCatalogSyncLock(
        tx,
        toMediaSyncMediaType(entityType),
        id
      );

      await dismissOpenSyncConflictsForMediaInTransaction(tx, auditLogService, {
        entityType,
        mediaId: id,
        actorUserId
      });

      await auditLogService.record({
        action: AuditAction.DELETE,
        source: AuditSource.ADMIN,
        entityType,
        entityId: id,
        before: existing,
        after: null,
        actorUserId: actorUserId ?? null,
        tx
      });
    }
  });
};

export const auditAdminMediaUpdate = async (params: {
  auditLogService: AuditLogService;
  entityType: "anime" | "manga" | "lightNovel";
  id: number;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  actorUserId?: number | null;
  tx?: Prisma.TransactionClient;
}): Promise<void> => {
  const diff = buildAuditFieldDiff(params.before, params.after, [
    ...CATALOG_AUDIT_FIELDS[params.entityType]
  ]);
  if (Object.keys(diff.after).length === 0) {
    return;
  }

  await params.auditLogService.record({
    action: AuditAction.UPDATE,
    source: AuditSource.ADMIN,
    entityType: params.entityType,
    entityId: params.id,
    before: diff.before,
    after: diff.after,
    actorUserId: params.actorUserId ?? null,
    tx: params.tx
  });
};

export const auditMediaCreate = async (params: {
  auditLogService: AuditLogService;
  entityType: "anime" | "manga" | "lightNovel";
  id: number;
  after: Record<string, unknown>;
  tx?: Prisma.TransactionClient;
}): Promise<void> => {
  await params.auditLogService.record({
    action: AuditAction.CREATE,
    source: AuditSource.CREATE,
    entityType: params.entityType,
    entityId: params.id,
    before: null,
    after: params.after,
    tx: params.tx
  });
};

const findActiveMedia = async (
  tx: Prisma.TransactionClient,
  entityType: "anime" | "manga" | "lightNovel",
  id: number
): Promise<Record<string, unknown> | null> => {
  if (entityType === "anime") {
    const row = await tx.anime.findFirst({
      where: { id, ...notDeletedMediaWhere }
    });
    return row as Record<string, unknown> | null;
  }
  if (entityType === "manga") {
    const row = await tx.manga.findFirst({
      where: { id, ...notDeletedMediaWhere }
    });
    return row as Record<string, unknown> | null;
  }
  const row = await tx.lightNovel.findFirst({
    where: { id, ...notDeletedMediaWhere }
  });
  return row as Record<string, unknown> | null;
};

const updateMediaDeletedAt = async (
  tx: Prisma.TransactionClient,
  entityType: "anime" | "manga" | "lightNovel",
  id: number,
  deletedAt: Date
): Promise<void> => {
  if (entityType === "anime") {
    await tx.anime.update({ where: { id }, data: { deletedAt } });
    return;
  }
  if (entityType === "manga") {
    await tx.manga.update({ where: { id }, data: { deletedAt } });
    return;
  }
  await tx.lightNovel.update({ where: { id }, data: { deletedAt } });
};
