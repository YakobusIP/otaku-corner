/*
  Warnings:

  - You are about to drop the `_AnimeGenres` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AnimeStudios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AnimeThemes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LightNovelAuthors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LightNovelGenres` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LightNovelThemes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MangaAuthors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MangaGenres` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MangaThemes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AnimeGenres" DROP CONSTRAINT "_AnimeGenres_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeGenres" DROP CONSTRAINT "_AnimeGenres_B_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeStudios" DROP CONSTRAINT "_AnimeStudios_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeStudios" DROP CONSTRAINT "_AnimeStudios_B_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeThemes" DROP CONSTRAINT "_AnimeThemes_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeThemes" DROP CONSTRAINT "_AnimeThemes_B_fkey";

-- DropForeignKey
ALTER TABLE "_LightNovelAuthors" DROP CONSTRAINT "_LightNovelAuthors_A_fkey";

-- DropForeignKey
ALTER TABLE "_LightNovelAuthors" DROP CONSTRAINT "_LightNovelAuthors_B_fkey";

-- DropForeignKey
ALTER TABLE "_LightNovelGenres" DROP CONSTRAINT "_LightNovelGenres_A_fkey";

-- DropForeignKey
ALTER TABLE "_LightNovelGenres" DROP CONSTRAINT "_LightNovelGenres_B_fkey";

-- DropForeignKey
ALTER TABLE "_LightNovelThemes" DROP CONSTRAINT "_LightNovelThemes_A_fkey";

-- DropForeignKey
ALTER TABLE "_LightNovelThemes" DROP CONSTRAINT "_LightNovelThemes_B_fkey";

-- DropForeignKey
ALTER TABLE "_MangaAuthors" DROP CONSTRAINT "_MangaAuthors_A_fkey";

-- DropForeignKey
ALTER TABLE "_MangaAuthors" DROP CONSTRAINT "_MangaAuthors_B_fkey";

-- DropForeignKey
ALTER TABLE "_MangaGenres" DROP CONSTRAINT "_MangaGenres_A_fkey";

-- DropForeignKey
ALTER TABLE "_MangaGenres" DROP CONSTRAINT "_MangaGenres_B_fkey";

-- DropForeignKey
ALTER TABLE "_MangaThemes" DROP CONSTRAINT "_MangaThemes_A_fkey";

-- DropForeignKey
ALTER TABLE "_MangaThemes" DROP CONSTRAINT "_MangaThemes_B_fkey";

-- DropTable
DROP TABLE "_AnimeGenres";

-- DropTable
DROP TABLE "_AnimeStudios";

-- DropTable
DROP TABLE "_AnimeThemes";

-- DropTable
DROP TABLE "_LightNovelAuthors";

-- DropTable
DROP TABLE "_LightNovelGenres";

-- DropTable
DROP TABLE "_LightNovelThemes";

-- DropTable
DROP TABLE "_MangaAuthors";

-- DropTable
DROP TABLE "_MangaGenres";

-- DropTable
DROP TABLE "_MangaThemes";

-- CreateTable
CREATE TABLE "AnimeGenres" (
    "animeId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "AnimeGenres_pkey" PRIMARY KEY ("animeId","genreId")
);

-- CreateTable
CREATE TABLE "MangaGenres" (
    "mangaId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "MangaGenres_pkey" PRIMARY KEY ("mangaId","genreId")
);

-- CreateTable
CREATE TABLE "LightNovelGenres" (
    "lightNovelId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "LightNovelGenres_pkey" PRIMARY KEY ("lightNovelId","genreId")
);

-- CreateTable
CREATE TABLE "AnimeStudios" (
    "animeId" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,

    CONSTRAINT "AnimeStudios_pkey" PRIMARY KEY ("animeId","studioId")
);

-- CreateTable
CREATE TABLE "AnimeThemes" (
    "animeId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,

    CONSTRAINT "AnimeThemes_pkey" PRIMARY KEY ("animeId","themeId")
);

-- CreateTable
CREATE TABLE "MangaThemes" (
    "mangaId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,

    CONSTRAINT "MangaThemes_pkey" PRIMARY KEY ("mangaId","themeId")
);

-- CreateTable
CREATE TABLE "LightNovelThemes" (
    "lightNovelId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,

    CONSTRAINT "LightNovelThemes_pkey" PRIMARY KEY ("lightNovelId","themeId")
);

-- CreateTable
CREATE TABLE "MangaAuthors" (
    "mangaId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "MangaAuthors_pkey" PRIMARY KEY ("mangaId","authorId")
);

-- CreateTable
CREATE TABLE "LightNovelAuthors" (
    "lightNovelId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "LightNovelAuthors_pkey" PRIMARY KEY ("lightNovelId","authorId")
);

-- AddForeignKey
ALTER TABLE "AnimeGenres" ADD CONSTRAINT "AnimeGenres_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeGenres" ADD CONSTRAINT "AnimeGenres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaGenres" ADD CONSTRAINT "MangaGenres_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaGenres" ADD CONSTRAINT "MangaGenres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelGenres" ADD CONSTRAINT "LightNovelGenres_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelGenres" ADD CONSTRAINT "LightNovelGenres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeStudios" ADD CONSTRAINT "AnimeStudios_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeStudios" ADD CONSTRAINT "AnimeStudios_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeThemes" ADD CONSTRAINT "AnimeThemes_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeThemes" ADD CONSTRAINT "AnimeThemes_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaThemes" ADD CONSTRAINT "MangaThemes_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaThemes" ADD CONSTRAINT "MangaThemes_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelThemes" ADD CONSTRAINT "LightNovelThemes_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelThemes" ADD CONSTRAINT "LightNovelThemes_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaAuthors" ADD CONSTRAINT "MangaAuthors_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaAuthors" ADD CONSTRAINT "MangaAuthors_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelAuthors" ADD CONSTRAINT "LightNovelAuthors_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelAuthors" ADD CONSTRAINT "LightNovelAuthors_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
