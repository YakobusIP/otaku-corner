import { Prisma } from "@prisma/client";
import type { MediaSyncMediaType } from "@prisma/client";

const MEDIA_TYPE_LOCK_CODES: Record<MediaSyncMediaType, number> = {
  ANIME: 1,
  MANGA: 2,
  LIGHT_NOVEL: 3
};

export const acquireMediaCatalogSyncLock = async (
  tx: Prisma.TransactionClient,
  mediaType: MediaSyncMediaType,
  mediaId: number
): Promise<void> => {
  const typeCode = MEDIA_TYPE_LOCK_CODES[mediaType];
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${typeCode}, ${mediaId})`;
};
