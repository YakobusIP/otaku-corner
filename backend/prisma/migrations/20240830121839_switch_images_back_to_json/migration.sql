/*
  Warnings:

  - You are about to drop the `AnimeImages` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `images` to the `Anime` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AnimeImages" DROP CONSTRAINT "AnimeImages_animeId_fkey";

-- AlterTable
ALTER TABLE "Anime" ADD COLUMN     "images" JSONB NOT NULL;

-- DropTable
DROP TABLE "AnimeImages";
