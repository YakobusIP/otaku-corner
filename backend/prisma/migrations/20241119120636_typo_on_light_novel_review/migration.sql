/*
  Warnings:

  - You are about to drop the column `lightReviewNovelId` on the `ReviewImage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_lightReviewNovelId_fkey";

-- AlterTable
ALTER TABLE "ReviewImage" DROP COLUMN "lightReviewNovelId",
ADD COLUMN     "lightNovelReviewId" TEXT;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_lightNovelReviewId_fkey" FOREIGN KEY ("lightNovelReviewId") REFERENCES "LightNovelReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
