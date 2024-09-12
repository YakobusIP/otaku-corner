/*
  Warnings:

  - You are about to drop the column `qualityRating` on the `LightNovel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LightNovel" DROP COLUMN "qualityRating",
ADD COLUMN     "illustrationRating" INTEGER,
ADD COLUMN     "worldBuildingRating" INTEGER;

-- AlterTable
ALTER TABLE "Manga" ADD COLUMN     "characterizationRating" INTEGER;
