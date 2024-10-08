/*
  Warnings:

  - You are about to drop the column `enjoymentRating` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `enjoymentRating` on the `LightNovel` table. All the data in the column will be lost.
  - You are about to drop the column `illustrationRating` on the `LightNovel` table. All the data in the column will be lost.
  - You are about to drop the column `characterizationRating` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `enjoymentRating` on the `Manga` table. All the data in the column will be lost.
  - You are about to drop the column `qualityRating` on the `Manga` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('PLAN_TO_WATCH', 'ON_HOLD', 'WATCHING', 'COMPLETED', 'DROPPED');

-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "enjoymentRating",
ADD COLUMN     "charDevelopmentRating" INTEGER,
ADD COLUMN     "progressStatus" "ProgressStatus" NOT NULL DEFAULT 'PLAN_TO_WATCH',
ADD COLUMN     "soundTrackRating" INTEGER;

-- AlterTable
ALTER TABLE "LightNovel" DROP COLUMN "enjoymentRating",
DROP COLUMN "illustrationRating",
ADD COLUMN     "charDevelopmentRating" INTEGER,
ADD COLUMN     "originalityRating" INTEGER,
ADD COLUMN     "progressStatus" "ProgressStatus" NOT NULL DEFAULT 'PLAN_TO_WATCH',
ADD COLUMN     "writingStyleRating" INTEGER;

-- AlterTable
ALTER TABLE "Manga" DROP COLUMN "characterizationRating",
DROP COLUMN "enjoymentRating",
DROP COLUMN "qualityRating",
ADD COLUMN     "artStyleRating" INTEGER,
ADD COLUMN     "charDevelopmentRating" INTEGER,
ADD COLUMN     "originalityRating" INTEGER,
ADD COLUMN     "progressStatus" "ProgressStatus" NOT NULL DEFAULT 'PLAN_TO_WATCH',
ADD COLUMN     "worldBuildingRating" INTEGER;
