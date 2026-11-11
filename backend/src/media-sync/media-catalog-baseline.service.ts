import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { isTrustedBaselineCatalog } from "@/media-sync/lib/catalog-baseline-trust";
import {
  catalogFieldsForMediaType,
  pickBaselineFieldUpdates,
  pickCatalogFields
} from "@/media-sync/lib/catalog-sync-fields";

import { MediaSyncMediaType, Prisma } from "@prisma/client";

@Injectable()
export class MediaCatalogBaselineService {
  constructor(private readonly prisma: PrismaService) {}

  async loadBaseline(
    mediaType: MediaSyncMediaType,
    mediaId: number,
    tx?: Prisma.TransactionClient
  ): Promise<Record<string, unknown> | null> {
    return this.loadBaselineInTransaction(mediaType, mediaId, tx);
  }

  async upsertBaseline(params: {
    mediaType: MediaSyncMediaType;
    mediaId: number;
    catalog: Record<string, unknown>;
    source: string;
    tx?: Prisma.TransactionClient;
  }): Promise<void> {
    const client = params.tx ?? this.prisma;
    await client.mediaCatalogSyncState.upsert({
      where: {
        mediaType_mediaId: {
          mediaType: params.mediaType,
          mediaId: params.mediaId
        }
      },
      create: {
        mediaType: params.mediaType,
        mediaId: params.mediaId,
        baselineCatalog: params.catalog as Prisma.InputJsonValue,
        baselineSource: params.source,
        lastSyncedAt: new Date()
      },
      update: {
        baselineCatalog: params.catalog as Prisma.InputJsonValue,
        baselineSource: params.source,
        lastSyncedAt: new Date()
      }
    });
  }

  async mergeBaselineFields(params: {
    mediaType: MediaSyncMediaType;
    mediaId: number;
    fieldValues: Record<string, unknown>;
    source: string;
    tx?: Prisma.TransactionClient;
  }): Promise<void> {
    const fields = catalogFieldsForMediaType(params.mediaType);
    const updates = pickBaselineFieldUpdates(params.fieldValues, fields);
    if (Object.keys(updates).length === 0) {
      return;
    }

    const existing =
      (await this.loadBaselineInTransaction(
        params.mediaType,
        params.mediaId,
        params.tx
      )) ?? {};

    const merged = {
      ...existing,
      ...updates
    };

    await this.upsertBaseline({
      mediaType: params.mediaType,
      mediaId: params.mediaId,
      catalog: merged,
      source: params.source,
      tx: params.tx
    });
  }

  buildBaselineSnapshot(
    mediaType: MediaSyncMediaType,
    record: Record<string, unknown>
  ): Record<string, unknown> {
    return pickCatalogFields(record, catalogFieldsForMediaType(mediaType));
  }

  private async loadBaselineInTransaction(
    mediaType: MediaSyncMediaType,
    mediaId: number,
    tx?: Prisma.TransactionClient
  ): Promise<Record<string, unknown> | null> {
    const client = tx ?? this.prisma;
    const row = await client.mediaCatalogSyncState.findUnique({
      where: {
        mediaType_mediaId: { mediaType, mediaId }
      }
    });
    if (!row) {
      return null;
    }

    const baselineCatalog = row.baselineCatalog as Record<string, unknown>;
    if (
      !isTrustedBaselineCatalog(baselineCatalog, row.baselineSource ?? null)
    ) {
      return null;
    }

    return baselineCatalog;
  }
}
