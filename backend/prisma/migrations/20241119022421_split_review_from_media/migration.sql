/*
  Warnings:

  - You are about to drop the column `charDevelopmentRating` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `consumedAt` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `personalScore` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `progressStatus` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `qualityRating` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `review` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `soundTrackRating` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `storylineRating` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `voiceActingRating` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `charDevelopmentRating` on the `LightNovel` table. All the data in the column will be lost.
  - You are about to drop the column `consumedAt` on the `LightNovel` table. All the data in the column will be lost.
  - You are about to drop the column `originalityRating` on the `LightNovel` table. All the data in the column will be lost.
  - You are about to drop the column `personalScore` on the `LightNovel` table. All the data in the column will be lost.
  - You are about to drop the column `progressStatus` on the `LightNovel` table. All the data in the column will be lost.
  - You are about to drop the column `review` on the `LightNovel` table. All the data in the column will be lost.
  - You are about to drop the column `storylineRating` on the `LightNovel` table. All the data in the column will be lost.
  - You are about to drop the column `worldBuildingRating` on the `LightNovel` table. All the data in the column will be lost.
  - You are about to drop the column `writingStyleRating` on the `LightNovel` table. All the data in the column will be lost.
  - You are about to drop the column `artStyleRating` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `charDevelopmentRating` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `consumedAt` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `originalityRating` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `personalScore` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `progressStatus` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `review` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `storylineRating` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `worldBuildingRating` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `animeId` on the `ReviewImage` table. All the data in the column will be lost.
  - You are about to drop the column `lightNovelId` on the `ReviewImage` table. All the data in the column will be lost.
  - You are about to drop the column `mangaId` on the `ReviewImage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_animeId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_lightNovelId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_mangaId_fkey";

-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "charDevelopmentRating",
DROP COLUMN "consumedAt",
DROP COLUMN "personalScore",
DROP COLUMN "progressStatus",
DROP COLUMN "qualityRating",
DROP COLUMN "review",
DROP COLUMN "soundTrackRating",
DROP COLUMN "storylineRating",
DROP COLUMN "voiceActingRating";

-- AlterTable
ALTER TABLE "LightNovel" DROP COLUMN "charDevelopmentRating",
DROP COLUMN "consumedAt",
DROP COLUMN "originalityRating",
DROP COLUMN "personalScore",
DROP COLUMN "progressStatus",
DROP COLUMN "review",
DROP COLUMN "storylineRating",
DROP COLUMN "worldBuildingRating",
DROP COLUMN "writingStyleRating";

-- AlterTable
ALTER TABLE "Manga" DROP COLUMN "artStyleRating",
DROP COLUMN "charDevelopmentRating",
DROP COLUMN "consumedAt",
DROP COLUMN "originalityRating",
DROP COLUMN "personalScore",
DROP COLUMN "progressStatus",
DROP COLUMN "review",
DROP COLUMN "storylineRating",
DROP COLUMN "worldBuildingRating";

-- AlterTable
ALTER TABLE "ReviewImage" DROP COLUMN "animeId",
DROP COLUMN "lightNovelId",
DROP COLUMN "mangaId",
ADD COLUMN     "animeReviewId" TEXT,
ADD COLUMN     "lightReviewNovelId" TEXT,
ADD COLUMN     "mangaReviewId" TEXT;

-- CreateTable
CREATE TABLE "AnimeReview" (
    "id" TEXT NOT NULL,
    "review" TEXT,
    "storylineRating" INTEGER,
    "qualityRating" INTEGER,
    "voiceActingRating" INTEGER,
    "soundTrackRating" INTEGER,
    "charDevelopmentRating" INTEGER,
    "personalScore" DOUBLE PRECISION,
    "progressStatus" "ProgressStatus" NOT NULL DEFAULT 'PLANNED',
    "consumedAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "animeId" TEXT NOT NULL,

    CONSTRAINT "AnimeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MangaReview" (
    "id" TEXT NOT NULL,
    "review" TEXT,
    "storylineRating" INTEGER,
    "artStyleRating" INTEGER,
    "charDevelopmentRating" INTEGER,
    "worldBuildingRating" INTEGER,
    "originalityRating" INTEGER,
    "personalScore" DOUBLE PRECISION,
    "progressStatus" "ProgressStatus" NOT NULL DEFAULT 'PLANNED',
    "consumedAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mangaId" TEXT NOT NULL,

    CONSTRAINT "MangaReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LightNovelReview" (
    "id" TEXT NOT NULL,
    "review" TEXT,
    "storylineRating" INTEGER,
    "worldBuildingRating" INTEGER,
    "writingStyleRating" INTEGER,
    "charDevelopmentRating" INTEGER,
    "originalityRating" INTEGER,
    "personalScore" DOUBLE PRECISION,
    "progressStatus" "ProgressStatus" NOT NULL DEFAULT 'PLANNED',
    "consumedAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lightNovelId" TEXT NOT NULL,

    CONSTRAINT "LightNovelReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnimeReview_animeId_key" ON "AnimeReview"("animeId");

-- CreateIndex
CREATE UNIQUE INDEX "MangaReview_mangaId_key" ON "MangaReview"("mangaId");

-- CreateIndex
CREATE UNIQUE INDEX "LightNovelReview_lightNovelId_key" ON "LightNovelReview"("lightNovelId");

-- AddForeignKey
ALTER TABLE "AnimeReview" ADD CONSTRAINT "AnimeReview_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaReview" ADD CONSTRAINT "MangaReview_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelReview" ADD CONSTRAINT "LightNovelReview_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_animeReviewId_fkey" FOREIGN KEY ("animeReviewId") REFERENCES "AnimeReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_mangaReviewId_fkey" FOREIGN KEY ("mangaReviewId") REFERENCES "MangaReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_lightReviewNovelId_fkey" FOREIGN KEY ("lightReviewNovelId") REFERENCES "LightNovelReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
