/*
  Warnings:

  - You are about to drop the column `animeId` on the `AnimeReview` table. All the data in the column will be lost.
  - You are about to drop the column `lightNovelId` on the `LightNovelReview` table. All the data in the column will be lost.
  - You are about to drop the column `mangaId` on the `MangaReview` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reviewId]` on the table `Anime` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reviewId]` on the table `LightNovel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reviewId]` on the table `Manga` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reviewId` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewId` to the `LightNovel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewId` to the `Manga` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AnimeReview" DROP CONSTRAINT "AnimeReview_animeId_fkey";

-- DropForeignKey
ALTER TABLE "LightNovelReview" DROP CONSTRAINT "LightNovelReview_lightNovelId_fkey";

-- DropForeignKey
ALTER TABLE "MangaReview" DROP CONSTRAINT "MangaReview_mangaId_fkey";

-- DropIndex
DROP INDEX "AnimeReview_animeId_key";

-- DropIndex
DROP INDEX "LightNovelReview_lightNovelId_key";

-- DropIndex
DROP INDEX "MangaReview_mangaId_key";

-- AlterTable
ALTER TABLE "Anime" ADD COLUMN     "reviewId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AnimeReview" DROP COLUMN "animeId";

-- AlterTable
ALTER TABLE "LightNovel" ADD COLUMN     "reviewId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LightNovelReview" DROP COLUMN "lightNovelId";

-- AlterTable
ALTER TABLE "Manga" ADD COLUMN     "reviewId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MangaReview" DROP COLUMN "mangaId";

-- CreateIndex
CREATE UNIQUE INDEX "Anime_reviewId_key" ON "Anime"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "LightNovel_reviewId_key" ON "LightNovel"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Manga_reviewId_key" ON "Manga"("reviewId");

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "AnimeReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manga" ADD CONSTRAINT "Manga_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "MangaReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovel" ADD CONSTRAINT "LightNovel_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "LightNovelReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
