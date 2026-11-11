-- CreateTable
CREATE TABLE "MediaCatalogSyncState" (
    "mediaType" "MediaSyncMediaType" NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "baselineCatalog" JSONB NOT NULL,
    "baselineSource" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaCatalogSyncState_pkey" PRIMARY KEY ("mediaType","mediaId")
);

-- AlterTable
ALTER TABLE "MediaSyncItem" ADD COLUMN "baselineCatalog" JSONB;
ALTER TABLE "MediaSyncItem" ADD COLUMN "resolvedAt" TIMESTAMP(3);
ALTER TABLE "MediaSyncItem" ADD COLUMN "resolvedByUserId" INTEGER;

-- Backfill baseline snapshots from current catalog fields (deleted media excluded).
INSERT INTO "MediaCatalogSyncState" (
    "mediaType",
    "mediaId",
    "baselineCatalog",
    "baselineSource",
    "lastSyncedAt",
    "updatedAt"
)
SELECT
    'ANIME'::"MediaSyncMediaType",
    "id",
    jsonb_build_object(
            'type', "type",
            'status', "status",
            'rating', "rating",
            'season', "season",
            'title', "title",
            'titleJapanese', "titleJapanese",
            'titleSynonyms', "titleSynonyms",
            'source', "source",
            'aired', "aired",
            'broadcast', "broadcast",
            'episodesCount', "episodesCount",
            'duration', "duration",
            'score', "score",
            'images', "images",
            'synopsis', "synopsis",
            'trailer', "trailer",
            'malUrl', "malUrl"
        ),
    'backfill',
    "updatedAt",
    CURRENT_TIMESTAMP
FROM "Anime"
WHERE "deletedAt" IS NULL;

INSERT INTO "MediaCatalogSyncState" (
    "mediaType",
    "mediaId",
    "baselineCatalog",
    "baselineSource",
    "lastSyncedAt",
    "updatedAt"
)
SELECT
    'MANGA'::"MediaSyncMediaType",
    "id",
    jsonb_build_object(
            'status', "status",
            'title', "title",
            'titleJapanese', "titleJapanese",
            'titleSynonyms', "titleSynonyms",
            'published', "published",
            'chaptersCount', "chaptersCount",
            'volumesCount', "volumesCount",
            'score', "score",
            'images', "images",
            'synopsis', "synopsis",
            'malUrl', "malUrl"
        ),
    'backfill',
    "updatedAt",
    CURRENT_TIMESTAMP
FROM "Manga"
WHERE "deletedAt" IS NULL;

INSERT INTO "MediaCatalogSyncState" (
    "mediaType",
    "mediaId",
    "baselineCatalog",
    "baselineSource",
    "lastSyncedAt",
    "updatedAt"
)
SELECT
    'LIGHT_NOVEL'::"MediaSyncMediaType",
    "id",
    jsonb_build_object(
            'status', "status",
            'title', "title",
            'titleJapanese', "titleJapanese",
            'titleSynonyms', "titleSynonyms",
            'published', "published",
            'volumesCount', "volumesCount",
            'score', "score",
            'images', "images",
            'synopsis', "synopsis",
            'malUrl', "malUrl"
        ),
    'backfill',
    "updatedAt",
    CURRENT_TIMESTAMP
FROM "LightNovel"
WHERE "deletedAt" IS NULL;
