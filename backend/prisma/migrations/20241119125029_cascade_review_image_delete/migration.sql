-- DropForeignKey
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_animeReviewId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_lightNovelReviewId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_mangaReviewId_fkey";

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_animeReviewId_fkey" FOREIGN KEY ("animeReviewId") REFERENCES "AnimeReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_mangaReviewId_fkey" FOREIGN KEY ("mangaReviewId") REFERENCES "MangaReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_lightNovelReviewId_fkey" FOREIGN KEY ("lightNovelReviewId") REFERENCES "LightNovelReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
