-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "LightNovel" DROP CONSTRAINT "LightNovel_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "Manga" DROP CONSTRAINT "Manga_reviewId_fkey";

-- AddForeignKey
ALTER TABLE "Anime" ADD CONSTRAINT "Anime_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "AnimeReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manga" ADD CONSTRAINT "Manga_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "MangaReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovel" ADD CONSTRAINT "LightNovel_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "LightNovelReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
