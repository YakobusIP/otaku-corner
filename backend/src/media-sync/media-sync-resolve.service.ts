import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import {
  MediaSyncConflictActionDto,
  MediaSyncItemDto,
  ResolveMediaSyncFieldsDto
} from "@/media-sync/dto";
import { isLegacyUntrustedConflictItem } from "@/media-sync/lib/catalog-conflict-legacy";
import {
  assertAcceptableApplyData,
  listBlockedAcceptUpstreamFields
} from "@/media-sync/lib/catalog-field-policy";
import {
  type SyncConflict,
  catalogValuesEqual
} from "@/media-sync/lib/catalog-sync-merge";
import { acquireMediaCatalogSyncLock } from "@/media-sync/lib/media-catalog-sync-lock";
import {
  MediaCatalogSyncService,
  type ResolutionAuditEntry
} from "@/media-sync/media-catalog-sync.service";

import {
  MediaSyncItemOutcome,
  MediaSyncMediaType,
  Prisma
} from "@prisma/client";

type FieldResolutionChoice = "accept_upstream" | "keep_local";
type StoredFieldResolutions = Record<string, FieldResolutionChoice>;

type ResolveConflictInput = {
  expectedVersion: number;
  resolutions?: ResolveMediaSyncFieldsDto["resolutions"];
  bulkChoice?: FieldResolutionChoice;
};

@Injectable()
export class MediaSyncResolveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogSyncService: MediaCatalogSyncService
  ) {}

  async acceptUpstream(
    itemId: string,
    body: MediaSyncConflictActionDto,
    actorUserId?: number | null
  ): Promise<MediaSyncItemDto> {
    return this.resolveConflictFields(
      itemId,
      {
        expectedVersion: body.expectedVersion,
        bulkChoice: "accept_upstream"
      },
      actorUserId
    );
  }

  async keepExisting(
    itemId: string,
    body: MediaSyncConflictActionDto,
    actorUserId?: number | null
  ): Promise<MediaSyncItemDto> {
    return this.resolveConflictFields(
      itemId,
      {
        expectedVersion: body.expectedVersion,
        bulkChoice: "keep_local"
      },
      actorUserId
    );
  }

  async resolveFields(
    itemId: string,
    body: ResolveMediaSyncFieldsDto,
    actorUserId?: number | null
  ): Promise<MediaSyncItemDto> {
    if (body.resolutions.length === 0) {
      throw new BadRequestException(
        "At least one field resolution is required"
      );
    }

    return this.resolveConflictFields(
      itemId,
      {
        expectedVersion: body.expectedVersion,
        resolutions: body.resolutions
      },
      actorUserId
    );
  }

  private async resolveConflictFields(
    itemId: string,
    input: ResolveConflictInput,
    actorUserId?: number | null
  ): Promise<MediaSyncItemDto> {
    let localRecord: Record<string, unknown> | null = null;
    let acceptDataForRefresh: Record<string, unknown> = {};

    type ResolveTransactionResult =
      | {
          kind: "resolved";
          row: {
            id: string;
            syncRunId: string;
            mediaType: MediaSyncMediaType;
            mediaId: number;
            mediaTitle: string | null;
            outcome: MediaSyncItemOutcome;
            errorMessage: string | null;
            conflicts: Prisma.JsonValue | null;
            pendingUpstream: Prisma.JsonValue | null;
            baselineCatalog: Prisma.JsonValue | null;
            fieldResolutions: Prisma.JsonValue | null;
            version: number;
            resolvedAt: Date | null;
            resolvedByUserId: number | null;
            createdAt: Date;
          };
        }
      | {
          kind: "stale_snapshot";
          mediaType: MediaSyncMediaType;
          mediaId: number;
        };

    const txResult: ResolveTransactionResult = await this.prisma.$transaction(
      async (tx) => {
        const current = await tx.mediaSyncItem.findUnique({
          where: { id: itemId }
        });
        if (!current) {
          throw new NotFoundException("Conflict item not found");
        }
        if (current.outcome !== MediaSyncItemOutcome.CONFLICT) {
          throw new ConflictException(
            "Conflict item was resolved by another request"
          );
        }

        if (current.version !== input.expectedVersion) {
          throw new ConflictException(
            "Conflict item version mismatch; review refreshed values"
          );
        }

        const canonicalOpenConflict = await tx.mediaSyncItem.findFirst({
          where: {
            mediaType: current.mediaType,
            mediaId: current.mediaId,
            outcome: MediaSyncItemOutcome.CONFLICT
          },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }]
        });
        if (canonicalOpenConflict && canonicalOpenConflict.id !== itemId) {
          throw new ConflictException(
            "A newer open conflict exists for this media; resolve the latest item"
          );
        }

        await acquireMediaCatalogSyncLock(
          tx,
          current.mediaType,
          current.mediaId
        );

        const conflicts = this.parseConflicts(current.conflicts);
        if (conflicts.length === 0) {
          throw new BadRequestException("Conflict item has no open fields");
        }

        const pendingUpstream = this.parsePendingUpstream(
          current.pendingUpstream
        );
        const priorResolutions = this.parseFieldResolutions(
          current.fieldResolutions
        );

        const resolutionEntries = this.buildResolutionEntries(input, conflicts);
        const resolutionMap = new Map<string, FieldResolutionChoice>();
        const openFields = new Set(conflicts.map((conflict) => conflict.field));

        if (input.bulkChoice === "accept_upstream") {
          const blockedFields = listBlockedAcceptUpstreamFields(
            current.mediaType,
            conflicts
          );
          if (blockedFields.length > 0) {
            throw new BadRequestException(
              `Cannot accept upstream for required fields with empty upstream values: ${blockedFields.join(", ")}. Keep local values instead.`
            );
          }
        }

        for (const resolution of resolutionEntries) {
          if (!openFields.has(resolution.field)) {
            throw new BadRequestException(
              `Field "${resolution.field}" is not an open conflict on this item`
            );
          }
          if (resolutionMap.has(resolution.field)) {
            throw new BadRequestException(
              `Duplicate resolution for field "${resolution.field}"`
            );
          }
          resolutionMap.set(resolution.field, resolution.choice);
        }

        const currentLocalRecord =
          await this.catalogSyncService.loadLocalRecordInTransaction(
            tx,
            current.mediaType,
            current.mediaId
          );
        if (!currentLocalRecord) {
          throw new NotFoundException("Media not found");
        }

        for (const [field, choice] of resolutionMap.entries()) {
          if (choice !== "accept_upstream") {
            continue;
          }
          const conflict = conflicts.find((entry) => entry.field === field);
          if (!conflict) {
            continue;
          }
          if (
            !catalogValuesEqual(
              field,
              conflict.local,
              currentLocalRecord[field]
            )
          ) {
            return {
              kind: "stale_snapshot" as const,
              mediaType: current.mediaType,
              mediaId: current.mediaId
            };
          }
        }

        const claim = await tx.mediaSyncItem.updateMany({
          where: {
            id: itemId,
            outcome: MediaSyncItemOutcome.CONFLICT,
            version: current.version
          },
          data: {
            version: { increment: 1 }
          }
        });
        if (claim.count === 0) {
          throw new ConflictException(
            "Conflict item version mismatch; review refreshed values"
          );
        }

        const claimedVersion = current.version + 1;
        const acceptData: Record<string, unknown> = {};
        const baselineUpdates: Record<string, unknown> = {};
        const resolutionAudit: ResolutionAuditEntry[] = [];

        for (const [field, choice] of resolutionMap.entries()) {
          const conflict = conflicts.find((entry) => entry.field === field);
          if (!conflict) {
            continue;
          }

          if (!Object.prototype.hasOwnProperty.call(pendingUpstream, field)) {
            if (conflict.upstream === undefined) {
              throw new BadRequestException(
                `Field "${field}" has no pending upstream value to resolve`
              );
            }
          }

          const upstreamValue = Object.prototype.hasOwnProperty.call(
            pendingUpstream,
            field
          )
            ? pendingUpstream[field]
            : conflict.upstream;
          const currentLocalValue = currentLocalRecord[field];

          if (choice === "accept_upstream") {
            acceptData[field] = upstreamValue;
          }

          baselineUpdates[field] = upstreamValue;
          resolutionAudit.push({
            field,
            choice,
            local: choice === "keep_local" ? currentLocalValue : conflict.local,
            upstream: upstreamValue
          });
        }

        try {
          assertAcceptableApplyData(current.mediaType, acceptData);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Invalid apply data";
          throw new BadRequestException(message);
        }

        acceptDataForRefresh = acceptData;

        const resolutionResult =
          await this.catalogSyncService.applyResolutionInTransaction({
            tx,
            mediaType: current.mediaType,
            mediaId: current.mediaId,
            applyData: acceptData,
            baselineUpdates,
            resolutionAudit,
            syncRunId: current.syncRunId,
            actorUserId: actorUserId ?? null
          });
        localRecord = resolutionResult.localRecord;

        const mergedResolutions: StoredFieldResolutions = {
          ...priorResolutions,
          ...Object.fromEntries(resolutionMap.entries())
        };

        const remainingConflicts = conflicts.filter(
          (conflict) => !resolutionMap.has(conflict.field)
        );
        const remainingPending = { ...pendingUpstream };
        for (const field of resolutionMap.keys()) {
          delete remainingPending[field];
        }

        const fullyResolved = remainingConflicts.length === 0;
        const finalOutcome = fullyResolved
          ? this.outcomeForResolutions(mergedResolutions)
          : MediaSyncItemOutcome.CONFLICT;

        const resolved = await tx.mediaSyncItem.update({
          where: {
            id: itemId,
            version: claimedVersion
          },
          data: {
            outcome: finalOutcome,
            conflicts:
              remainingConflicts.length > 0
                ? (remainingConflicts as Prisma.InputJsonValue)
                : Prisma.JsonNull,
            pendingUpstream:
              Object.keys(remainingPending).length > 0
                ? (remainingPending as Prisma.InputJsonValue)
                : Prisma.JsonNull,
            fieldResolutions: mergedResolutions as Prisma.InputJsonValue,
            resolvedAt: fullyResolved ? new Date() : null,
            resolvedByUserId: fullyResolved ? (actorUserId ?? null) : null
          }
        });

        if (fullyResolved) {
          const acceptedAny = Object.values(mergedResolutions).some(
            (choice) => choice === "accept_upstream"
          );
          await tx.mediaSyncRun.update({
            where: { id: current.syncRunId },
            data: {
              conflictedCount: { decrement: 1 },
              ...(acceptedAny
                ? { updatedCount: { increment: 1 } }
                : { unchangedCount: { increment: 1 } })
            }
          });
        }

        return { kind: "resolved" as const, row: resolved };
      }
    );

    if (txResult.kind === "stale_snapshot") {
      await this.catalogSyncService.refreshOpenConflictSnapshotsAfterLocalEdit({
        mediaType: txResult.mediaType,
        mediaId: txResult.mediaId
      });
      throw new ConflictException(
        "Local catalog changed since the conflict snapshot; review refreshed values"
      );
    }

    const updated = txResult.row;

    if (localRecord) {
      this.catalogSyncService.enqueueAnimeEpisodeRefreshIfNeeded(
        updated.mediaType,
        updated.mediaId,
        acceptDataForRefresh,
        localRecord
      );
    }

    return this.toItemDto(updated);
  }

  private buildResolutionEntries(
    input: ResolveConflictInput,
    conflicts: SyncConflict[]
  ): ResolveMediaSyncFieldsDto["resolutions"] {
    if (input.resolutions) {
      return input.resolutions;
    }

    if (!input.bulkChoice) {
      throw new BadRequestException(
        "At least one field resolution is required"
      );
    }

    return conflicts.map((conflict) => ({
      field: conflict.field,
      choice: input.bulkChoice as FieldResolutionChoice
    }));
  }

  private outcomeForResolutions(
    resolutions: StoredFieldResolutions
  ): MediaSyncItemOutcome {
    const acceptedAny = Object.values(resolutions).some(
      (choice) => choice === "accept_upstream"
    );
    return acceptedAny
      ? MediaSyncItemOutcome.RESOLVED_ACCEPTED
      : MediaSyncItemOutcome.RESOLVED_KEPT;
  }

  private parseConflicts(value: Prisma.JsonValue | null): SyncConflict[] {
    if (!value || !Array.isArray(value)) {
      return [];
    }
    return value as SyncConflict[];
  }

  private parsePendingUpstream(
    value: Prisma.JsonValue | null
  ): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private parseFieldResolutions(
    value: Prisma.JsonValue | null
  ): StoredFieldResolutions {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }
    return value as StoredFieldResolutions;
  }

  private toItemDto(row: {
    id: string;
    syncRunId: string;
    mediaType: MediaSyncItemDto["mediaType"];
    mediaId: number;
    mediaTitle: string | null;
    outcome: MediaSyncItemDto["outcome"];
    errorMessage: string | null;
    conflicts: Prisma.JsonValue | null;
    pendingUpstream: Prisma.JsonValue | null;
    baselineCatalog: Prisma.JsonValue | null;
    fieldResolutions: Prisma.JsonValue | null;
    version: number;
    resolvedAt: Date | null;
    resolvedByUserId: number | null;
    createdAt: Date;
  }): MediaSyncItemDto {
    return {
      id: row.id,
      syncRunId: row.syncRunId,
      mediaType: row.mediaType,
      mediaId: row.mediaId,
      mediaTitle: row.mediaTitle,
      outcome: row.outcome,
      errorMessage: row.errorMessage,
      conflicts: row.conflicts as MediaSyncItemDto["conflicts"],
      pendingUpstream:
        row.pendingUpstream as MediaSyncItemDto["pendingUpstream"],
      baselineCatalog:
        row.baselineCatalog as MediaSyncItemDto["baselineCatalog"],
      fieldResolutions:
        row.fieldResolutions as MediaSyncItemDto["fieldResolutions"],
      version: row.version,
      isLegacyUntrusted: isLegacyUntrustedConflictItem(row),
      resolvedAt: row.resolvedAt,
      resolvedByUserId: row.resolvedByUserId,
      createdAt: row.createdAt
    };
  }
}
