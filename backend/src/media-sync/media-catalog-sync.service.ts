import { Injectable, NotFoundException } from "@nestjs/common";

import { AuditLogService } from "@/common/audit/audit-log.service";
import { notDeletedMediaWhere } from "@/common/media/not-deleted-media-where";

import { PrismaService } from "@/prisma/prisma.service";

import { FetchEpisodesQueueService } from "@/anime/fetch-episodes.queue";
import { ExternalMetadataEnrichmentService } from "@/media-sync/external-metadata-enrichment.service";
import {
  collectContestedConflictFields,
  isLegacyUntrustedConflictItem,
  mergeOpenConflictFields,
  mergeTrustedOpenConflictFields,
  omitCatalogFields,
  openConflictDisplayChanged,
  parseConflictItemBaselineCatalog,
  refreshOpenConflictSnapshots
} from "@/media-sync/lib/catalog-conflict-legacy";
import {
  type StoredFieldResolutions,
  buildConflictBaselineSnapshot,
  buildPendingUpstreamFromConflicts,
  outcomeForFieldResolutions,
  reconcilePlanConflictsWithResolutions
} from "@/media-sync/lib/catalog-conflict-reconcile";
import {
  assertAcceptableApplyData,
  sanitizeBaselineUpdates,
  sanitizeCatalogApplyData
} from "@/media-sync/lib/catalog-field-policy";
import { shouldPersistCatalogSyncFailure } from "@/media-sync/lib/catalog-sync-error";
import { catalogFieldsForMediaType } from "@/media-sync/lib/catalog-sync-fields";
import { type SyncConflict } from "@/media-sync/lib/catalog-sync-merge";
import { computeCatalogMergePlan } from "@/media-sync/lib/catalog-sync-plan";
import { lockMediaCatalogRowForUpdate } from "@/media-sync/lib/media-catalog-row-lock";
import { acquireMediaCatalogSyncLock } from "@/media-sync/lib/media-catalog-sync-lock";
import {
  mapTenraiAnimeToCatalog,
  mapTenraiLightNovelToCatalog,
  mapTenraiMangaToCatalog
} from "@/media-sync/lib/tenrai-catalog-mapper";
import { MediaCatalogBaselineService } from "@/media-sync/media-catalog-baseline.service";
import { TenraiProxyService } from "@/tenrai/tenrai-proxy.service";

import {
  AuditAction,
  AuditSource,
  MediaSyncItemOutcome,
  MediaSyncMediaType,
  Prisma
} from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { v4 as uuidv4 } from "uuid";

export type CatalogSyncResult = {
  outcome: MediaSyncItemOutcome;
  mediaTitle: string | null;
  conflicts: SyncConflict[];
  errorMessage?: string;
};

export type ResolutionAuditEntry = {
  field: string;
  choice: "accept_upstream" | "keep_local";
  local: unknown;
  upstream: unknown;
};

@Injectable()
export class MediaCatalogSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenraiProxy: TenraiProxyService,
    private readonly enrichment: ExternalMetadataEnrichmentService,
    private readonly auditLogService: AuditLogService,
    private readonly fetchEpisodesQueue: FetchEpisodesQueueService,
    private readonly baselineService: MediaCatalogBaselineService
  ) {}

  async syncMedia(params: {
    mediaType: MediaSyncMediaType;
    mediaId: number;
    syncRunId: string;
    correlationId?: string;
    requestId?: string | null;
    attempt?: number;
    maxAttempts?: number;
  }): Promise<CatalogSyncResult> {
    const correlationId = params.correlationId ?? uuidv4();
    const httpContext = {
      correlation_id: correlationId,
      request_id: params.requestId ?? null,
      queue_name: "mediaCatalogSyncQueue",
      job_name: "sync-media-catalog"
    };

    let mediaTitle: string | null = null;

    try {
      const previewLocal = await this.loadLocalMedia(
        params.mediaType,
        params.mediaId
      );
      if (!previewLocal) {
        throw new NotFoundException("Media not found or deleted");
      }
      mediaTitle = previewLocal.title;

      const upstreamCatalog = await this.fetchUpstreamCatalog({
        mediaType: params.mediaType,
        mediaId: params.mediaId,
        local: previewLocal,
        httpContext
      });

      if (!upstreamCatalog) {
        return this.recordOutcomeAtomically({
          syncRunId: params.syncRunId,
          mediaType: params.mediaType,
          mediaId: params.mediaId,
          mediaTitle,
          outcome: MediaSyncItemOutcome.FAILED,
          errorMessage: "Invalid Tenrai catalog payload"
        });
      }

      const baselineSource = this.buildBaselineSource(params.mediaType);
      const fields = catalogFieldsForMediaType(params.mediaType);

      let syncResult: {
        outcome: MediaSyncItemOutcome;
        mediaTitle: string | null;
        conflicts: SyncConflict[];
        errorMessage?: string;
        episodeRefresh: {
          mediaId: number;
          applyData: Record<string, unknown>;
          localRecord: Record<string, unknown>;
        } | null;
      };

      try {
        syncResult = await this.prisma.$transaction(async (tx) => {
          await acquireMediaCatalogSyncLock(
            tx,
            params.mediaType,
            params.mediaId
          );

          const local = await this.loadLocalMediaInTransaction(
            tx,
            params.mediaType,
            params.mediaId
          );
          if (!local) {
            throw new NotFoundException("Media not found or deleted");
          }

          const existingItem = await this.findSyncItemForRunMedia(tx, {
            syncRunId: params.syncRunId,
            mediaType: params.mediaType,
            mediaId: params.mediaId
          });
          if (existingItem) {
            return {
              outcome: existingItem.outcome,
              mediaTitle: existingItem.mediaTitle,
              conflicts: this.parseConflicts(existingItem.conflicts),
              errorMessage: existingItem.errorMessage ?? undefined,
              episodeRefresh: null
            };
          }

          const openConflictItem = await tx.mediaSyncItem.findFirst({
            where: {
              mediaType: params.mediaType,
              mediaId: params.mediaId,
              outcome: MediaSyncItemOutcome.CONFLICT
            },
            orderBy: { createdAt: "desc" }
          });

          const storedBaseline = await this.baselineService.loadBaseline(
            params.mediaType,
            params.mediaId,
            tx
          );

          const plan = computeCatalogMergePlan({
            mediaType: params.mediaType,
            fields,
            localRecord: local.record,
            upstreamCatalog,
            storedBaseline
          });

          const applyData = sanitizeCatalogApplyData(
            params.mediaType,
            plan.applyData
          );
          let baselineUpdates = sanitizeBaselineUpdates(
            params.mediaType,
            plan.baselineUpdates
          );

          let conflicts = plan.conflicts;
          let outcome: MediaSyncItemOutcome;
          let openConflictResolutions: StoredFieldResolutions | null = null;
          const isLegacyOpenConflict =
            openConflictItem !== null &&
            isLegacyUntrustedConflictItem(openConflictItem);

          if (isLegacyOpenConflict && openConflictItem) {
            openConflictResolutions = this.parseFieldResolutions(
              openConflictItem.fieldResolutions
            );
            const existingConflicts = this.parseConflicts(
              openConflictItem.conflicts
            );
            const reconciledPlanConflicts =
              reconcilePlanConflictsWithResolutions({
                planConflicts: plan.conflicts,
                priorResolutions: openConflictResolutions,
                storedBaseline
              });
            const mergedConflicts = mergeOpenConflictFields(
              existingConflicts,
              reconciledPlanConflicts
            );
            conflicts = refreshOpenConflictSnapshots(
              mergedConflicts,
              local.record,
              upstreamCatalog
            );

            const contestedFields = collectContestedConflictFields(conflicts);
            const safeApplyData = omitCatalogFields(applyData, contestedFields);
            const safeBaselineUpdates = omitCatalogFields(
              baselineUpdates,
              contestedFields
            );

            Object.keys(applyData).forEach((key) => delete applyData[key]);
            Object.assign(applyData, safeApplyData);
            baselineUpdates = safeBaselineUpdates;

            outcome =
              Object.keys(applyData).length > 0
                ? MediaSyncItemOutcome.UPDATED
                : MediaSyncItemOutcome.UNCHANGED;
          } else if (openConflictItem) {
            openConflictResolutions = this.parseFieldResolutions(
              openConflictItem.fieldResolutions
            );
            const existingConflicts = this.parseConflicts(
              openConflictItem.conflicts
            );
            const reconciledPlanConflicts =
              reconcilePlanConflictsWithResolutions({
                planConflicts: plan.conflicts,
                priorResolutions: openConflictResolutions,
                storedBaseline
              });
            const mergedConflicts = mergeTrustedOpenConflictFields(
              existingConflicts,
              reconciledPlanConflicts
            );
            conflicts = refreshOpenConflictSnapshots(
              mergedConflicts,
              local.record,
              upstreamCatalog
            );

            const contestedFields = collectContestedConflictFields(conflicts);
            const safeApplyData = omitCatalogFields(applyData, contestedFields);
            const safeBaselineUpdates = omitCatalogFields(
              baselineUpdates,
              contestedFields
            );

            Object.keys(applyData).forEach((key) => delete applyData[key]);
            Object.assign(applyData, safeApplyData);
            baselineUpdates = safeBaselineUpdates;

            outcome =
              Object.keys(applyData).length > 0
                ? MediaSyncItemOutcome.UPDATED
                : MediaSyncItemOutcome.UNCHANGED;
          } else if (conflicts.length > 0) {
            outcome = MediaSyncItemOutcome.CONFLICT;
          } else if (Object.keys(applyData).length === 0) {
            outcome = MediaSyncItemOutcome.UNCHANGED;
          } else {
            outcome = MediaSyncItemOutcome.UPDATED;
          }

          if (Object.keys(applyData).length > 0) {
            await this.applyCatalogChangesInTransaction({
              tx,
              mediaType: params.mediaType,
              mediaId: params.mediaId,
              applyData,
              localRecord: local.record,
              syncRunId: params.syncRunId,
              auditSource: AuditSource.SYNC
            });
          }

          if (Object.keys(baselineUpdates).length > 0) {
            await this.baselineService.mergeBaselineFields({
              mediaType: params.mediaType,
              mediaId: params.mediaId,
              fieldValues: baselineUpdates,
              source: baselineSource.join("+"),
              tx
            });
          }

          const localRecordForSnapshot = { ...local.record, ...applyData };
          const baselineSnapshot = this.baselineService.buildBaselineSnapshot(
            params.mediaType,
            localRecordForSnapshot
          );

          if (
            openConflictItem &&
            openConflictResolutions &&
            !isLegacyOpenConflict
          ) {
            const storedConflictBaseline = parseConflictItemBaselineCatalog(
              openConflictItem.baselineCatalog
            );
            const conflictBaseline = buildConflictBaselineSnapshot(
              { ...plan.conflictBaseline, ...storedConflictBaseline },
              conflicts
            );
            const openPendingUpstream =
              buildPendingUpstreamFromConflicts(conflicts);
            const refreshedBaselineCatalog = {
              ...baselineSnapshot,
              ...conflictBaseline
            };

            if (conflicts.length > 0) {
              await this.refreshOpenConflictItemInTransaction(tx, {
                itemId: openConflictItem.id,
                syncRunId: openConflictItem.syncRunId,
                mediaType: params.mediaType,
                mediaId: params.mediaId,
                mediaTitle: local.title,
                conflicts,
                pendingUpstream: openPendingUpstream,
                baselineCatalog: refreshedBaselineCatalog,
                fieldResolutions: openConflictResolutions,
                currentSyncRunId: params.syncRunId,
                priorConflicts: this.parseConflicts(openConflictItem.conflicts),
                priorPendingUpstream: this.parsePendingUpstream(
                  openConflictItem.pendingUpstream
                ),
                priorMediaTitle: openConflictItem.mediaTitle
              });
            } else {
              await this.closeOpenConflictItemInTransaction(tx, {
                itemId: openConflictItem.id,
                syncRunId: openConflictItem.syncRunId,
                mediaType: params.mediaType,
                mediaId: params.mediaId,
                fieldResolutions: openConflictResolutions,
                currentSyncRunId: params.syncRunId
              });
            }
          } else if (isLegacyOpenConflict && openConflictItem) {
            const openPendingUpstream =
              buildPendingUpstreamFromConflicts(conflicts);
            const legacyBaseline = buildConflictBaselineSnapshot(
              this.baselineService.buildBaselineSnapshot(
                params.mediaType,
                local.record
              ),
              conflicts
            );

            if (conflicts.length > 0) {
              await this.refreshLegacyOpenConflictItemInTransaction(tx, {
                itemId: openConflictItem.id,
                syncRunId: openConflictItem.syncRunId,
                mediaType: params.mediaType,
                mediaId: params.mediaId,
                mediaTitle: local.title,
                conflicts,
                pendingUpstream: openPendingUpstream,
                baselineCatalog: legacyBaseline,
                fieldResolutions: openConflictResolutions ?? {},
                currentSyncRunId: params.syncRunId,
                priorConflicts: this.parseConflicts(openConflictItem.conflicts),
                priorPendingUpstream: this.parsePendingUpstream(
                  openConflictItem.pendingUpstream
                ),
                priorMediaTitle: openConflictItem.mediaTitle
              });
            } else {
              await this.closeOpenConflictItemInTransaction(tx, {
                itemId: openConflictItem.id,
                syncRunId: openConflictItem.syncRunId,
                mediaType: params.mediaType,
                mediaId: params.mediaId,
                fieldResolutions: openConflictResolutions ?? {},
                currentSyncRunId: params.syncRunId
              });
            }
          }

          const pendingUpstream = buildPendingUpstreamFromConflicts(conflicts);
          const conflictBaseline = buildConflictBaselineSnapshot(
            plan.conflictBaseline,
            conflicts
          );

          await this.recordSyncItemInTransaction(tx, {
            syncRunId: params.syncRunId,
            mediaType: params.mediaType,
            mediaId: params.mediaId,
            mediaTitle: local.title,
            outcome,
            conflicts:
              !openConflictItem && conflicts.length > 0 ? conflicts : undefined,
            pendingUpstream:
              !openConflictItem && Object.keys(pendingUpstream).length > 0
                ? pendingUpstream
                : undefined,
            baselineCatalog:
              !openConflictItem && conflicts.length > 0
                ? { ...baselineSnapshot, ...conflictBaseline }
                : undefined,
            errorMessage: null
          });

          const episodeRefresh =
            Object.keys(applyData).length > 0 &&
            params.mediaType === MediaSyncMediaType.ANIME
              ? {
                  mediaId: params.mediaId,
                  applyData,
                  localRecord: { ...local.record, ...applyData }
                }
              : null;

          return {
            outcome,
            mediaTitle: local.title,
            conflicts,
            episodeRefresh
          };
        });
      } catch (error: unknown) {
        if (!this.isSyncItemPerRunUniqueViolation(error)) {
          throw error;
        }

        const racedItem = await this.findSyncItemForRunMedia(this.prisma, {
          syncRunId: params.syncRunId,
          mediaType: params.mediaType,
          mediaId: params.mediaId
        });
        if (!racedItem) {
          throw error;
        }

        syncResult = {
          outcome: racedItem.outcome,
          mediaTitle: racedItem.mediaTitle,
          conflicts: this.parseConflicts(racedItem.conflicts),
          errorMessage: racedItem.errorMessage ?? undefined,
          episodeRefresh: null
        };
      }

      if (syncResult.episodeRefresh) {
        this.enqueueAnimeEpisodeRefreshIfNeeded(
          MediaSyncMediaType.ANIME,
          syncResult.episodeRefresh.mediaId,
          syncResult.episodeRefresh.applyData,
          syncResult.episodeRefresh.localRecord
        );
      }

      return {
        outcome: syncResult.outcome,
        mediaTitle: syncResult.mediaTitle,
        conflicts: syncResult.conflicts,
        errorMessage: syncResult.errorMessage
      };
    } catch (error: unknown) {
      const attempt = params.attempt ?? 1;
      const maxAttempts = params.maxAttempts ?? 1;

      if (!shouldPersistCatalogSyncFailure(error, attempt, maxAttempts)) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : "Unknown catalog sync error";
      return this.recordOutcomeAtomically({
        syncRunId: params.syncRunId,
        mediaType: params.mediaType,
        mediaId: params.mediaId,
        mediaTitle,
        outcome: MediaSyncItemOutcome.FAILED,
        errorMessage: message
      });
    }
  }

  async recordTerminalSyncFailure(params: {
    syncRunId: string;
    mediaType: MediaSyncMediaType;
    mediaId: number;
    mediaTitle?: string | null;
    errorMessage: string;
  }): Promise<CatalogSyncResult> {
    return this.recordOutcomeAtomically({
      syncRunId: params.syncRunId,
      mediaType: params.mediaType,
      mediaId: params.mediaId,
      mediaTitle: params.mediaTitle ?? null,
      outcome: MediaSyncItemOutcome.FAILED,
      errorMessage: params.errorMessage
    });
  }

  async loadLocalRecordInTransaction(
    tx: Prisma.TransactionClient,
    mediaType: MediaSyncMediaType,
    mediaId: number
  ): Promise<Record<string, unknown> | null> {
    const local = await this.loadLocalMediaInTransaction(
      tx,
      mediaType,
      mediaId
    );
    return local?.record ?? null;
  }

  async applyResolutionInTransaction(params: {
    tx: Prisma.TransactionClient;
    mediaType: MediaSyncMediaType;
    mediaId: number;
    applyData: Record<string, unknown>;
    baselineUpdates: Record<string, unknown>;
    resolutionAudit: ResolutionAuditEntry[];
    syncRunId: string;
    actorUserId?: number | null;
    baselineSource?: string;
  }): Promise<{ localRecord: Record<string, unknown> }> {
    await acquireMediaCatalogSyncLock(
      params.tx,
      params.mediaType,
      params.mediaId
    );

    const local = await this.loadLocalMediaInTransaction(
      params.tx,
      params.mediaType,
      params.mediaId
    );
    if (!local) {
      throw new NotFoundException("Media not found");
    }

    const applyData = sanitizeCatalogApplyData(
      params.mediaType,
      params.applyData
    );
    assertAcceptableApplyData(params.mediaType, applyData);

    const baselineUpdates = sanitizeBaselineUpdates(
      params.mediaType,
      params.baselineUpdates
    );

    if (Object.keys(applyData).length > 0) {
      await this.applyCatalogChangesInTransaction({
        tx: params.tx,
        mediaType: params.mediaType,
        mediaId: params.mediaId,
        applyData,
        localRecord: local.record,
        syncRunId: params.syncRunId,
        auditSource: AuditSource.ADMIN,
        actorUserId: params.actorUserId ?? null
      });
    }

    for (const entry of params.resolutionAudit) {
      if (entry.choice !== "keep_local") {
        continue;
      }

      await this.auditLogService.record({
        action: AuditAction.UPDATE,
        source: AuditSource.ADMIN,
        entityType: this.entityType(params.mediaType),
        entityId: params.mediaId,
        before: {
          _syncResolution: {
            field: entry.field,
            choice: entry.choice,
            kept: entry.local,
            upstream: entry.upstream
          }
        },
        after: {
          _syncResolution: {
            field: entry.field,
            choice: entry.choice,
            kept: entry.local,
            upstream: entry.upstream
          }
        },
        syncRunId: params.syncRunId,
        actorUserId: params.actorUserId ?? null,
        tx: params.tx
      });
    }

    if (Object.keys(baselineUpdates).length > 0) {
      await this.baselineService.mergeBaselineFields({
        mediaType: params.mediaType,
        mediaId: params.mediaId,
        fieldValues: baselineUpdates,
        source: params.baselineSource ?? "admin-resolve",
        tx: params.tx
      });
    }

    const refreshed = await this.loadLocalMediaInTransaction(
      params.tx,
      params.mediaType,
      params.mediaId
    );
    if (!refreshed) {
      throw new NotFoundException("Media not found");
    }

    return { localRecord: refreshed.record };
  }

  async refreshOpenConflictSnapshotsAfterLocalEdit(params: {
    mediaType: MediaSyncMediaType;
    mediaId: number;
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await acquireMediaCatalogSyncLock(tx, params.mediaType, params.mediaId);

      const openConflictItem = await tx.mediaSyncItem.findFirst({
        where: {
          mediaType: params.mediaType,
          mediaId: params.mediaId,
          outcome: MediaSyncItemOutcome.CONFLICT
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }]
      });
      if (!openConflictItem) {
        return;
      }

      const localRecord = await this.loadLocalRecordInTransaction(
        tx,
        params.mediaType,
        params.mediaId
      );
      if (!localRecord) {
        return;
      }

      await this.refreshOpenConflictItemFromLocalInTransaction(tx, {
        item: openConflictItem,
        localRecord
      });
    });
  }

  async refreshOpenConflictItemFromLocalInTransaction(
    tx: Prisma.TransactionClient,
    params: {
      item: {
        id: string;
        syncRunId: string;
        mediaType: MediaSyncMediaType;
        mediaId: number;
        mediaTitle: string | null;
        outcome: MediaSyncItemOutcome;
        conflicts: Prisma.JsonValue | null;
        pendingUpstream: Prisma.JsonValue | null;
        baselineCatalog: Prisma.JsonValue | null;
        fieldResolutions: Prisma.JsonValue | null;
        version: number;
      };
      localRecord: Record<string, unknown>;
      claimedVersion?: number;
    }
  ): Promise<void> {
    const conflicts = this.parseConflicts(params.item.conflicts);
    if (conflicts.length === 0) {
      return;
    }

    const pendingUpstream = this.parsePendingUpstream(
      params.item.pendingUpstream
    );
    const upstreamCatalog = { ...pendingUpstream };
    for (const conflict of conflicts) {
      if (
        !Object.prototype.hasOwnProperty.call(upstreamCatalog, conflict.field)
      ) {
        upstreamCatalog[conflict.field] = conflict.upstream;
      }
    }

    const refreshedConflicts = refreshOpenConflictSnapshots(
      conflicts,
      params.localRecord,
      upstreamCatalog
    );
    const refreshedPendingUpstream =
      buildPendingUpstreamFromConflicts(refreshedConflicts);
    const isLegacy = isLegacyUntrustedConflictItem(params.item);
    const fieldResolutions = this.parseFieldResolutions(
      params.item.fieldResolutions
    );
    const baselineCatalog = isLegacy
      ? buildConflictBaselineSnapshot(
          this.baselineService.buildBaselineSnapshot(
            params.item.mediaType,
            params.localRecord
          ),
          refreshedConflicts
        )
      : {
          ...parseConflictItemBaselineCatalog(params.item.baselineCatalog),
          ...buildConflictBaselineSnapshot({}, refreshedConflicts)
        };

    if (isLegacy) {
      await this.refreshLegacyOpenConflictItemInTransaction(tx, {
        itemId: params.item.id,
        syncRunId: params.item.syncRunId,
        mediaType: params.item.mediaType,
        mediaId: params.item.mediaId,
        mediaTitle:
          typeof params.localRecord.title === "string"
            ? params.localRecord.title
            : (params.item.mediaTitle ?? ""),
        conflicts: refreshedConflicts,
        pendingUpstream: refreshedPendingUpstream,
        baselineCatalog,
        fieldResolutions,
        currentSyncRunId: params.item.syncRunId,
        priorConflicts: conflicts,
        priorPendingUpstream: pendingUpstream,
        priorMediaTitle: params.item.mediaTitle
      });
      return;
    }

    await this.refreshOpenConflictItemInTransaction(tx, {
      itemId: params.item.id,
      syncRunId: params.item.syncRunId,
      mediaType: params.item.mediaType,
      mediaId: params.item.mediaId,
      mediaTitle:
        typeof params.localRecord.title === "string"
          ? params.localRecord.title
          : (params.item.mediaTitle ?? ""),
      conflicts: refreshedConflicts,
      pendingUpstream: refreshedPendingUpstream,
      baselineCatalog,
      fieldResolutions,
      currentSyncRunId: params.item.syncRunId,
      priorConflicts: conflicts,
      priorPendingUpstream: pendingUpstream,
      priorMediaTitle: params.item.mediaTitle
    });
  }

  enqueueAnimeEpisodeRefreshIfNeeded(
    mediaType: MediaSyncMediaType,
    mediaId: number,
    applyData: Record<string, unknown>,
    localRecord: Record<string, unknown>
  ): void {
    if (
      mediaType !== MediaSyncMediaType.ANIME ||
      Object.keys(applyData).length === 0
    ) {
      return;
    }

    const animeType =
      typeof applyData.type === "string"
        ? applyData.type
        : typeof localRecord.type === "string"
          ? localRecord.type
          : "";
    this.fetchEpisodesQueue.enqueueAfterCreate(mediaId, animeType);
  }

  async applyAcceptedUpstream(params: {
    mediaType: MediaSyncMediaType;
    mediaId: number;
    applyData: Record<string, unknown>;
    syncRunId: string;
    actorUserId?: number | null;
    baselineSource?: string;
  }): Promise<void> {
    const local = await this.loadLocalMedia(params.mediaType, params.mediaId);
    if (!local) {
      throw new NotFoundException("Media not found");
    }

    const applyData = sanitizeCatalogApplyData(
      params.mediaType,
      params.applyData
    );
    assertAcceptableApplyData(params.mediaType, applyData);

    await this.prisma.$transaction(async (tx) => {
      await this.applyResolutionInTransaction({
        tx,
        mediaType: params.mediaType,
        mediaId: params.mediaId,
        applyData,
        baselineUpdates: applyData,
        resolutionAudit: [],
        syncRunId: params.syncRunId,
        actorUserId: params.actorUserId ?? null,
        baselineSource: params.baselineSource
      });
    });

    this.enqueueAnimeEpisodeRefreshIfNeeded(
      params.mediaType,
      params.mediaId,
      applyData,
      local.record
    );
  }

  private async recordOutcomeAtomically(input: {
    syncRunId: string;
    mediaType: MediaSyncMediaType;
    mediaId: number;
    mediaTitle: string | null;
    outcome: MediaSyncItemOutcome;
    errorMessage?: string;
  }): Promise<CatalogSyncResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await acquireMediaCatalogSyncLock(tx, input.mediaType, input.mediaId);

        const existingItem = await this.findSyncItemForRunMedia(tx, input);
        if (existingItem) {
          return this.toCatalogSyncResult(existingItem);
        }

        await this.recordSyncItemInTransaction(tx, {
          syncRunId: input.syncRunId,
          mediaType: input.mediaType,
          mediaId: input.mediaId,
          mediaTitle: input.mediaTitle,
          outcome: input.outcome,
          errorMessage: input.errorMessage ?? null
        });

        return {
          outcome: input.outcome,
          mediaTitle: input.mediaTitle,
          conflicts: [],
          errorMessage: input.errorMessage
        };
      });
    } catch (error: unknown) {
      if (!this.isSyncItemPerRunUniqueViolation(error)) {
        throw error;
      }

      return this.readSyncItemOutcomeAfterUniqueRace(input);
    }
  }

  private async readSyncItemOutcomeAfterUniqueRace(input: {
    syncRunId: string;
    mediaType: MediaSyncMediaType;
    mediaId: number;
  }): Promise<CatalogSyncResult> {
    const racedItem = await this.findSyncItemForRunMedia(this.prisma, input);
    if (!racedItem) {
      throw new Error(
        "Media sync item uniqueness violation without persisted row"
      );
    }
    return this.toCatalogSyncResult(racedItem);
  }

  private async fetchUpstreamCatalog(params: {
    mediaType: MediaSyncMediaType;
    mediaId: number;
    local: {
      title: string;
      titleJapanese: string;
      record: Record<string, unknown>;
    };
    httpContext: Record<string, unknown>;
  }): Promise<Record<string, unknown> | null> {
    const tenraiPath =
      params.mediaType === MediaSyncMediaType.ANIME
        ? `/anime/${params.mediaId}`
        : `/manga/${params.mediaId}`;

    const tenraiPayload = await this.tenraiProxy.forwardGet(
      tenraiPath,
      {},
      {
        ...params.httpContext,
        endpoint:
          params.mediaType === MediaSyncMediaType.ANIME
            ? "tenrai.anime.detail"
            : "tenrai.manga.detail"
      }
    );

    const upstreamCatalog = this.mapTenraiPayload(
      params.mediaType,
      tenraiPayload
    );
    if (!upstreamCatalog) {
      return null;
    }

    if (params.mediaType === MediaSyncMediaType.MANGA) {
      const counts = await this.enrichment.fetchMangaCounts(
        params.mediaId,
        params.local.title,
        params.local.titleJapanese,
        {
          ...params.httpContext,
          provider: "anilist",
          method: "POST",
          endpoint: "anilist.graphql"
        }
      );
      if (counts?.chaptersCount !== undefined) {
        upstreamCatalog.chaptersCount = counts.chaptersCount;
      }
      if (counts?.volumesCount !== undefined) {
        upstreamCatalog.volumesCount = counts.volumesCount;
      }
    }

    if (params.mediaType === MediaSyncMediaType.LIGHT_NOVEL) {
      const volumeCount = await this.enrichment.fetchLightNovelVolumeCount(
        params.local.title,
        params.local.titleJapanese,
        {
          ...params.httpContext,
          provider: "ranobedb",
          method: "GET",
          endpoint: "ranobedb.series.search"
        }
      );
      if (volumeCount !== null) {
        upstreamCatalog.volumesCount = volumeCount;
      }
    }

    return upstreamCatalog;
  }

  private parseConflicts(value: Prisma.JsonValue | null): SyncConflict[] {
    if (!value || !Array.isArray(value)) {
      return [];
    }
    return value as SyncConflict[];
  }

  private parseFieldResolutions(
    value: Prisma.JsonValue | null
  ): StoredFieldResolutions {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }
    return value as StoredFieldResolutions;
  }

  private parsePendingUpstream(
    value: Prisma.JsonValue | null
  ): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private async refreshOpenConflictItemInTransaction(
    tx: Prisma.TransactionClient,
    params: {
      itemId: string;
      syncRunId: string;
      mediaType: MediaSyncMediaType;
      mediaId: number;
      mediaTitle: string;
      conflicts: SyncConflict[];
      pendingUpstream: Record<string, unknown>;
      baselineCatalog: Record<string, unknown>;
      fieldResolutions: StoredFieldResolutions;
      currentSyncRunId: string;
      priorConflicts: SyncConflict[];
      priorPendingUpstream: Record<string, unknown>;
      priorMediaTitle: string | null;
    }
  ): Promise<void> {
    const displayChanged = openConflictDisplayChanged({
      beforeConflicts: params.priorConflicts,
      afterConflicts: params.conflicts,
      beforePendingUpstream: params.priorPendingUpstream,
      afterPendingUpstream: params.pendingUpstream,
      beforeMediaTitle: params.priorMediaTitle,
      afterMediaTitle: params.mediaTitle
    });

    await tx.mediaSyncItem.update({
      where: { id: params.itemId },
      data: {
        mediaTitle: params.mediaTitle,
        conflicts: params.conflicts as Prisma.InputJsonValue,
        pendingUpstream: params.pendingUpstream as Prisma.InputJsonValue,
        baselineCatalog: params.baselineCatalog as Prisma.InputJsonValue,
        fieldResolutions: params.fieldResolutions as Prisma.InputJsonValue,
        ...(displayChanged ? { version: { increment: 1 } } : {})
      }
    });

    if (!displayChanged) {
      return;
    }

    await this.auditLogService.record({
      action: AuditAction.UPDATE,
      source: AuditSource.SYNC,
      entityType: this.entityType(params.mediaType),
      entityId: params.mediaId,
      before: {
        _syncConflictRefresh: {
          itemId: params.itemId,
          syncRunId: params.syncRunId
        }
      },
      after: {
        _syncConflictRefresh: {
          openFields: params.conflicts.map((conflict) => conflict.field),
          versionBumped: true
        }
      },
      syncRunId: params.currentSyncRunId,
      tx
    });
  }

  private async refreshLegacyOpenConflictItemInTransaction(
    tx: Prisma.TransactionClient,
    params: {
      itemId: string;
      syncRunId: string;
      mediaType: MediaSyncMediaType;
      mediaId: number;
      mediaTitle: string;
      conflicts: SyncConflict[];
      pendingUpstream: Record<string, unknown>;
      baselineCatalog: Record<string, unknown>;
      fieldResolutions: StoredFieldResolutions;
      currentSyncRunId: string;
      priorConflicts: SyncConflict[];
      priorPendingUpstream: Record<string, unknown>;
      priorMediaTitle: string | null;
    }
  ): Promise<void> {
    const displayChanged = openConflictDisplayChanged({
      beforeConflicts: params.priorConflicts,
      afterConflicts: params.conflicts,
      beforePendingUpstream: params.priorPendingUpstream,
      afterPendingUpstream: params.pendingUpstream,
      beforeMediaTitle: params.priorMediaTitle,
      afterMediaTitle: params.mediaTitle
    });

    await tx.mediaSyncItem.update({
      where: { id: params.itemId },
      data: {
        mediaTitle: params.mediaTitle,
        conflicts: params.conflicts as Prisma.InputJsonValue,
        pendingUpstream: params.pendingUpstream as Prisma.InputJsonValue,
        baselineCatalog: params.baselineCatalog as Prisma.InputJsonValue,
        fieldResolutions: params.fieldResolutions as Prisma.InputJsonValue,
        ...(displayChanged ? { version: { increment: 1 } } : {})
      }
    });

    if (!displayChanged) {
      return;
    }

    await this.auditLogService.record({
      action: AuditAction.UPDATE,
      source: AuditSource.SYNC,
      entityType: this.entityType(params.mediaType),
      entityId: params.mediaId,
      before: {
        _syncLegacyConflictRefresh: {
          itemId: params.itemId,
          syncRunId: params.syncRunId
        }
      },
      after: {
        _syncLegacyConflictRefresh: {
          openFields: params.conflicts.map((conflict) => conflict.field),
          versionBumped: true
        }
      },
      syncRunId: params.currentSyncRunId,
      tx
    });
  }

  private async closeOpenConflictItemInTransaction(
    tx: Prisma.TransactionClient,
    params: {
      itemId: string;
      syncRunId: string;
      mediaType: MediaSyncMediaType;
      mediaId: number;
      fieldResolutions: StoredFieldResolutions;
      currentSyncRunId: string;
    }
  ): Promise<void> {
    const finalOutcome = outcomeForFieldResolutions(params.fieldResolutions);
    const acceptedAny = finalOutcome === MediaSyncItemOutcome.RESOLVED_ACCEPTED;

    await tx.mediaSyncItem.update({
      where: { id: params.itemId },
      data: {
        outcome: finalOutcome,
        conflicts: Prisma.JsonNull,
        pendingUpstream: Prisma.JsonNull,
        resolvedAt: new Date(),
        resolvedByUserId: null,
        fieldResolutions: params.fieldResolutions as Prisma.InputJsonValue,
        version: { increment: 1 }
      }
    });

    await tx.mediaSyncRun.update({
      where: { id: params.syncRunId },
      data: {
        conflictedCount: { decrement: 1 },
        ...(acceptedAny
          ? { updatedCount: { increment: 1 } }
          : { unchangedCount: { increment: 1 } })
      }
    });

    await this.auditLogService.record({
      action: AuditAction.UPDATE,
      source: AuditSource.SYNC,
      entityType: this.entityType(params.mediaType),
      entityId: params.mediaId,
      before: {
        _syncConflictAutoClose: {
          itemId: params.itemId,
          syncRunId: params.syncRunId
        }
      },
      after: {
        _syncConflictAutoClose: {
          outcome: finalOutcome,
          fieldResolutions: params.fieldResolutions
        }
      },
      syncRunId: params.currentSyncRunId,
      tx
    });
  }

  private async loadLocalMediaInTransaction(
    tx: Prisma.TransactionClient,
    mediaType: MediaSyncMediaType,
    mediaId: number
  ): Promise<{
    title: string;
    titleJapanese: string;
    record: Record<string, unknown>;
  } | null> {
    const locked = await lockMediaCatalogRowForUpdate(tx, mediaType, mediaId);
    if (!locked) {
      return null;
    }

    if (mediaType === MediaSyncMediaType.ANIME) {
      const row = await tx.anime.findFirst({
        where: { id: mediaId, ...notDeletedMediaWhere }
      });
      if (!row) {
        return null;
      }
      return {
        title: row.title,
        titleJapanese: row.titleJapanese,
        record: row as unknown as Record<string, unknown>
      };
    }

    if (mediaType === MediaSyncMediaType.MANGA) {
      const row = await tx.manga.findFirst({
        where: { id: mediaId, ...notDeletedMediaWhere }
      });
      if (!row) {
        return null;
      }
      return {
        title: row.title,
        titleJapanese: row.titleJapanese,
        record: row as unknown as Record<string, unknown>
      };
    }

    const row = await tx.lightNovel.findFirst({
      where: { id: mediaId, ...notDeletedMediaWhere }
    });
    if (!row) {
      return null;
    }
    return {
      title: row.title,
      titleJapanese: row.titleJapanese,
      record: row as unknown as Record<string, unknown>
    };
  }

  private async applyCatalogChangesInTransaction(params: {
    tx: Prisma.TransactionClient;
    mediaType: MediaSyncMediaType;
    mediaId: number;
    applyData: Record<string, unknown>;
    localRecord: Record<string, unknown>;
    syncRunId: string;
    auditSource: typeof AuditSource.SYNC | typeof AuditSource.ADMIN;
    actorUserId?: number | null;
  }): Promise<void> {
    const beforeRecord: Record<string, unknown> = {};
    const afterRecord: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(params.applyData)) {
      beforeRecord[field] = params.localRecord[field] ?? null;
      afterRecord[field] = value;
    }

    await this.updateMedia(
      params.tx,
      params.mediaType,
      params.mediaId,
      params.applyData
    );

    if (
      params.mediaType === MediaSyncMediaType.LIGHT_NOVEL &&
      typeof params.applyData.volumesCount === "number"
    ) {
      await this.reconcileLightNovelVolumes(
        params.tx,
        params.mediaId,
        params.applyData.volumesCount
      );
    }

    if (Object.keys(afterRecord).length > 0) {
      await this.auditLogService.record({
        action: AuditAction.UPDATE,
        source: params.auditSource,
        entityType: this.entityType(params.mediaType),
        entityId: params.mediaId,
        before: beforeRecord,
        after: afterRecord,
        syncRunId: params.syncRunId,
        actorUserId: params.actorUserId ?? null,
        tx: params.tx
      });
    }
  }

  private buildBaselineSource(mediaType: MediaSyncMediaType): string[] {
    const sources = ["tenrai"];
    if (mediaType === MediaSyncMediaType.MANGA) {
      return sources;
    }
    if (mediaType === MediaSyncMediaType.LIGHT_NOVEL) {
      return sources;
    }
    return sources;
  }

  private async loadLocalMedia(
    mediaType: MediaSyncMediaType,
    mediaId: number
  ): Promise<{
    title: string;
    titleJapanese: string;
    record: Record<string, unknown>;
  } | null> {
    if (mediaType === MediaSyncMediaType.ANIME) {
      const row = await this.prisma.anime.findFirst({
        where: { id: mediaId, ...notDeletedMediaWhere }
      });
      if (!row) {
        return null;
      }
      return {
        title: row.title,
        titleJapanese: row.titleJapanese,
        record: row as unknown as Record<string, unknown>
      };
    }

    if (mediaType === MediaSyncMediaType.MANGA) {
      const row = await this.prisma.manga.findFirst({
        where: { id: mediaId, ...notDeletedMediaWhere }
      });
      if (!row) {
        return null;
      }
      return {
        title: row.title,
        titleJapanese: row.titleJapanese,
        record: row as unknown as Record<string, unknown>
      };
    }

    const row = await this.prisma.lightNovel.findFirst({
      where: { id: mediaId, ...notDeletedMediaWhere }
    });
    if (!row) {
      return null;
    }
    return {
      title: row.title,
      titleJapanese: row.titleJapanese,
      record: row as unknown as Record<string, unknown>
    };
  }

  private mapTenraiPayload(
    mediaType: MediaSyncMediaType,
    payload: unknown
  ): Record<string, unknown> | null {
    if (mediaType === MediaSyncMediaType.ANIME) {
      return mapTenraiAnimeToCatalog(payload);
    }
    if (mediaType === MediaSyncMediaType.MANGA) {
      return mapTenraiMangaToCatalog(payload);
    }
    return mapTenraiLightNovelToCatalog(payload);
  }

  private entityType(mediaType: MediaSyncMediaType): string {
    switch (mediaType) {
      case MediaSyncMediaType.ANIME:
        return "anime";
      case MediaSyncMediaType.MANGA:
        return "manga";
      case MediaSyncMediaType.LIGHT_NOVEL:
        return "lightNovel";
    }
  }

  private async updateMedia(
    tx: Prisma.TransactionClient,
    mediaType: MediaSyncMediaType,
    mediaId: number,
    data: Record<string, unknown>
  ): Promise<void> {
    if (mediaType === MediaSyncMediaType.ANIME) {
      await tx.anime.update({ where: { id: mediaId }, data });
      return;
    }
    if (mediaType === MediaSyncMediaType.MANGA) {
      await tx.manga.update({ where: { id: mediaId }, data });
      return;
    }
    await tx.lightNovel.update({ where: { id: mediaId }, data });
  }

  private async reconcileLightNovelVolumes(
    tx: Prisma.TransactionClient,
    lightNovelId: number,
    newCount: number
  ): Promise<void> {
    await tx.lightNovelVolumes.deleteMany({
      where: {
        lightNovelId,
        volumeNumber: { gt: newCount },
        consumedAt: null
      }
    });

    if (newCount <= 0) {
      return;
    }

    const existingRows = await tx.lightNovelVolumes.findMany({
      where: { lightNovelId },
      select: { volumeNumber: true }
    });
    const present = new Set(existingRows.map((row) => row.volumeNumber));
    const missing: Prisma.LightNovelVolumesCreateManyInput[] = [];
    for (let volumeNumber = 1; volumeNumber <= newCount; volumeNumber += 1) {
      if (!present.has(volumeNumber)) {
        missing.push({ lightNovelId, volumeNumber, consumedAt: null });
      }
    }
    if (missing.length > 0) {
      await tx.lightNovelVolumes.createMany({ data: missing });
    }
  }

  private async recordSyncItemInTransaction(
    tx: Prisma.TransactionClient,
    input: {
      syncRunId: string;
      mediaType: MediaSyncMediaType;
      mediaId: number;
      mediaTitle: string | null;
      outcome: MediaSyncItemOutcome;
      conflicts?: SyncConflict[];
      pendingUpstream?: Record<string, unknown>;
      baselineCatalog?: Record<string, unknown>;
      errorMessage?: string | null;
    }
  ): Promise<void> {
    await tx.mediaSyncItem.create({
      data: {
        syncRunId: input.syncRunId,
        mediaType: input.mediaType,
        mediaId: input.mediaId,
        mediaTitle: input.mediaTitle,
        outcome: input.outcome,
        conflicts:
          input.conflicts && input.conflicts.length > 0
            ? (input.conflicts as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        pendingUpstream: input.pendingUpstream
          ? (input.pendingUpstream as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        baselineCatalog: input.baselineCatalog
          ? (input.baselineCatalog as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        errorMessage: input.errorMessage ?? null
      }
    });

    const counterField = this.counterFieldForOutcome(input.outcome);
    await tx.mediaSyncRun.update({
      where: { id: input.syncRunId },
      data: {
        touchedCount: { increment: 1 },
        [counterField]: { increment: 1 }
      }
    });
  }

  private async findSyncItemForRunMedia(
    tx: Pick<Prisma.TransactionClient, "mediaSyncItem">,
    input: {
      syncRunId: string;
      mediaType: MediaSyncMediaType;
      mediaId: number;
    }
  ) {
    return tx.mediaSyncItem.findUnique({
      where: {
        syncRunId_mediaType_mediaId: {
          syncRunId: input.syncRunId,
          mediaType: input.mediaType,
          mediaId: input.mediaId
        }
      }
    });
  }

  private toCatalogSyncResult(item: {
    outcome: MediaSyncItemOutcome;
    mediaTitle: string | null;
    conflicts: Prisma.JsonValue | null;
    errorMessage: string | null;
  }): CatalogSyncResult {
    return {
      outcome: item.outcome,
      mediaTitle: item.mediaTitle,
      conflicts: this.parseConflicts(item.conflicts),
      errorMessage: item.errorMessage ?? undefined
    };
  }

  private isSyncItemPerRunUniqueViolation(error: unknown): boolean {
    if (!(error instanceof PrismaClientKnownRequestError)) {
      return false;
    }
    if (error.code !== "P2002") {
      return false;
    }
    const target = error.meta?.target;
    if (!Array.isArray(target)) {
      return false;
    }
    const fields = new Set(
      target.filter((value): value is string => typeof value === "string")
    );
    return (
      fields.has("syncRunId") &&
      fields.has("mediaType") &&
      fields.has("mediaId")
    );
  }

  private counterFieldForOutcome(
    outcome: MediaSyncItemOutcome
  ): "updatedCount" | "unchangedCount" | "conflictedCount" | "failedCount" {
    switch (outcome) {
      case MediaSyncItemOutcome.UPDATED:
      case MediaSyncItemOutcome.RESOLVED_ACCEPTED:
        return "updatedCount";
      case MediaSyncItemOutcome.UNCHANGED:
      case MediaSyncItemOutcome.RESOLVED_KEPT:
      case MediaSyncItemOutcome.RESOLVED_DISMISSED:
        return "unchangedCount";
      case MediaSyncItemOutcome.CONFLICT:
        return "conflictedCount";
      case MediaSyncItemOutcome.FAILED:
        return "failedCount";
    }
  }
}
