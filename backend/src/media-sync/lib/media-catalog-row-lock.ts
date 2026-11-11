import { type MediaSyncMediaType, Prisma } from "@prisma/client";

/** Locks the live catalog row before reading local values in a sync/resolve transaction. */
export const lockMediaCatalogRowForUpdate = async (
  tx: Prisma.TransactionClient,
  mediaType: MediaSyncMediaType,
  mediaId: number
): Promise<boolean> => {
  switch (mediaType) {
    case "ANIME": {
      const rows = await tx.$queryRaw<{ id: number }[]>`
        SELECT id FROM "Anime"
        WHERE id = ${mediaId} AND "deletedAt" IS NULL
        FOR UPDATE
      `;
      return rows.length > 0;
    }
    case "MANGA": {
      const rows = await tx.$queryRaw<{ id: number }[]>`
        SELECT id FROM "Manga"
        WHERE id = ${mediaId} AND "deletedAt" IS NULL
        FOR UPDATE
      `;
      return rows.length > 0;
    }
    case "LIGHT_NOVEL": {
      const rows = await tx.$queryRaw<{ id: number }[]>`
        SELECT id FROM "LightNovel"
        WHERE id = ${mediaId} AND "deletedAt" IS NULL
        FOR UPDATE
      `;
      return rows.length > 0;
    }
  }
};
