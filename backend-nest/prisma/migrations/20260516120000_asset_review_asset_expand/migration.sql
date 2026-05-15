-- CreateEnum
CREATE TYPE "AssetMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('PENDING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "ReviewAssetUsage" AS ENUM ('IMAGE');

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "mediaType" "AssetMediaType" NOT NULL,
    "expectedFileSize" INTEGER NOT NULL,
    "fileSize" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "durationMs" INTEGER,
    "status" "AssetStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewAsset" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "animeReviewId" INTEGER,
    "mangaReviewId" INTEGER,
    "lightNovelReviewId" INTEGER,
    "usage" "ReviewAssetUsage" NOT NULL DEFAULT 'IMAGE',
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_storageKey_key" ON "Asset"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_url_key" ON "Asset"("url");

-- CreateIndex
CREATE INDEX "Asset_status_createdAt_idx" ON "Asset"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Asset_mediaType_idx" ON "Asset"("mediaType");

-- CreateIndex
CREATE INDEX "ReviewAsset_animeReviewId_idx" ON "ReviewAsset"("animeReviewId");

-- CreateIndex
CREATE INDEX "ReviewAsset_mangaReviewId_idx" ON "ReviewAsset"("mangaReviewId");

-- CreateIndex
CREATE INDEX "ReviewAsset_lightNovelReviewId_idx" ON "ReviewAsset"("lightNovelReviewId");

-- CreateIndex
CREATE INDEX "ReviewAsset_assetId_idx" ON "ReviewAsset"("assetId");

-- AddForeignKey
ALTER TABLE "ReviewAsset" ADD CONSTRAINT "ReviewAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAsset" ADD CONSTRAINT "ReviewAsset_animeReviewId_fkey" FOREIGN KEY ("animeReviewId") REFERENCES "AnimeReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAsset" ADD CONSTRAINT "ReviewAsset_mangaReviewId_fkey" FOREIGN KEY ("mangaReviewId") REFERENCES "MangaReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAsset" ADD CONSTRAINT "ReviewAsset_lightNovelReviewId_fkey" FOREIGN KEY ("lightNovelReviewId") REFERENCES "LightNovelReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReviewAsset" ADD CONSTRAINT "ReviewAsset_exactly_one_review" CHECK (
    (
        CASE WHEN "animeReviewId" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN "mangaReviewId" IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN "lightNovelReviewId" IS NOT NULL THEN 1 ELSE 0 END
    ) = 1
);
