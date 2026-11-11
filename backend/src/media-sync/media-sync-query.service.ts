import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import {
  MediaSyncItemDto,
  MediaSyncItemQueryDto,
  MediaSyncRunDetailDto,
  MediaSyncRunQueryDto,
  PaginatedMediaSyncRunResponseDto,
  PaginatedOpenMediaSyncConflictsDto
} from "@/media-sync/dto";
import { isLegacyUntrustedConflictItem } from "@/media-sync/lib/catalog-conflict-legacy";

import {
  MediaSyncItem,
  MediaSyncItemOutcome,
  MediaSyncRun,
  Prisma
} from "@prisma/client";

@Injectable()
export class MediaSyncQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findRuns(
    query: MediaSyncRunQueryDto
  ): Promise<PaginatedMediaSyncRunResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.mediaSyncRun.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      this.prisma.mediaSyncRun.count()
    ]);

    return {
      data: rows.map((row) => this.toRunListItem(row)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findRunDetail(
    id: string,
    query: MediaSyncItemQueryDto
  ): Promise<MediaSyncRunDetailDto> {
    const run = await this.prisma.mediaSyncRun.findUnique({ where: { id } });
    if (!run) {
      throw new NotFoundException("Media sync run not found");
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.MediaSyncItemWhereInput = {
      syncRunId: id,
      ...(query.outcome ? { outcome: query.outcome } : {})
    };

    const [items, itemsTotal, runMediaKeys, relatedOpenConflicts] =
      await Promise.all([
        this.prisma.mediaSyncItem.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit
        }),
        this.prisma.mediaSyncItem.count({ where }),
        this.prisma.mediaSyncItem.findMany({
          where: { syncRunId: id },
          select: { mediaType: true, mediaId: true },
          distinct: ["mediaType", "mediaId"]
        }),
        this.findRelatedOpenConflictsForRun(id)
      ]);

    return {
      ...this.toRunListItem(run),
      errorMessage: run.errorMessage,
      items: items.map((item) => this.toItemDto(item)),
      itemsTotal,
      itemsPage: page,
      itemsLimit: limit,
      itemsTotalPages: Math.ceil(itemsTotal / limit),
      relatedOpenConflicts: relatedOpenConflicts.map((item) =>
        this.toItemDto(item)
      ),
      touchedMediaCount: runMediaKeys.length
    };
  }

  private async findRelatedOpenConflictsForRun(
    syncRunId: string
  ): Promise<MediaSyncItem[]> {
    const runMedia = await this.prisma.mediaSyncItem.findMany({
      where: { syncRunId },
      select: { mediaType: true, mediaId: true },
      distinct: ["mediaType", "mediaId"]
    });

    if (runMedia.length === 0) {
      return [];
    }

    return this.prisma.mediaSyncItem.findMany({
      where: {
        outcome: MediaSyncItemOutcome.CONFLICT,
        syncRunId: { not: syncRunId },
        OR: runMedia.map((entry) => ({
          mediaType: entry.mediaType,
          mediaId: entry.mediaId
        }))
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }]
    });
  }

  async findOpenConflicts(
    query: MediaSyncRunQueryDto
  ): Promise<PaginatedOpenMediaSyncConflictsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = { outcome: MediaSyncItemOutcome.CONFLICT };

    const [rows, total] = await Promise.all([
      this.prisma.mediaSyncItem.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip,
        take: limit
      }),
      this.prisma.mediaSyncItem.count({ where })
    ]);

    return {
      data: rows.map((row) => this.toItemDto(row)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  private toRunListItem(
    row: MediaSyncRun
  ): PaginatedMediaSyncRunResponseDto["data"][number] {
    return {
      id: row.id,
      type: row.type,
      status: row.status,
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      touchedCount: row.touchedCount,
      updatedCount: row.updatedCount,
      unchangedCount: row.unchangedCount,
      conflictedCount: row.conflictedCount,
      failedCount: row.failedCount,
      createdAt: row.createdAt
    };
  }

  private toItemDto(row: MediaSyncItem): MediaSyncItemDto {
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
