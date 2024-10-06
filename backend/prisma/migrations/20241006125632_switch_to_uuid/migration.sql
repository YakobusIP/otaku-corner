/*
  Warnings:

  - The primary key for the `AdminPin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Anime` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `AnimeEpisode` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Author` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Genre` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LightNovel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Manga` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ReviewImage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Studio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Theme` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "AnimeEpisode" DROP CONSTRAINT "AnimeEpisode_animeId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_animeId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_lightNovelId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_mangaId_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeGenres" DROP CONSTRAINT "_AnimeGenres_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeGenres" DROP CONSTRAINT "_AnimeGenres_B_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeThemes" DROP CONSTRAINT "_AnimeThemes_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeThemes" DROP CONSTRAINT "_AnimeThemes_B_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeToStudio" DROP CONSTRAINT "_AnimeToStudio_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeToStudio" DROP CONSTRAINT "_AnimeToStudio_B_fkey";

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

-- AlterTable
ALTER TABLE "AdminPin" DROP CONSTRAINT "AdminPin_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AdminPin_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AdminPin_id_seq";

-- AlterTable
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Anime_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Anime_id_seq";

-- AlterTable
ALTER TABLE "AnimeEpisode" DROP CONSTRAINT "AnimeEpisode_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "animeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "AnimeEpisode_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AnimeEpisode_id_seq";

-- AlterTable
ALTER TABLE "Author" DROP CONSTRAINT "Author_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Author_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Author_id_seq";

-- AlterTable
ALTER TABLE "Genre" DROP CONSTRAINT "Genre_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Genre_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Genre_id_seq";

-- AlterTable
ALTER TABLE "LightNovel" DROP CONSTRAINT "LightNovel_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "LightNovel_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LightNovel_id_seq";

-- AlterTable
ALTER TABLE "Manga" DROP CONSTRAINT "Manga_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Manga_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Manga_id_seq";

-- AlterTable
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_pkey",
ALTER COLUMN "animeId" SET DATA TYPE TEXT,
ALTER COLUMN "mangaId" SET DATA TYPE TEXT,
ALTER COLUMN "lightNovelId" SET DATA TYPE TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ReviewImage_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ReviewImage_id_seq";

-- AlterTable
ALTER TABLE "Studio" DROP CONSTRAINT "Studio_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Studio_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Studio_id_seq";

-- AlterTable
ALTER TABLE "Theme" DROP CONSTRAINT "Theme_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Theme_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Theme_id_seq";

-- AlterTable
ALTER TABLE "_AnimeGenres" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_AnimeThemes" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_AnimeToStudio" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_LightNovelAuthors" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_LightNovelGenres" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_LightNovelThemes" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_MangaAuthors" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_MangaGenres" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_MangaThemes" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "AnimeEpisode" ADD CONSTRAINT "AnimeEpisode_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeGenres" ADD CONSTRAINT "_AnimeGenres_A_fkey" FOREIGN KEY ("A") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeGenres" ADD CONSTRAINT "_AnimeGenres_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToStudio" ADD CONSTRAINT "_AnimeToStudio_A_fkey" FOREIGN KEY ("A") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToStudio" ADD CONSTRAINT "_AnimeToStudio_B_fkey" FOREIGN KEY ("B") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeThemes" ADD CONSTRAINT "_AnimeThemes_A_fkey" FOREIGN KEY ("A") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeThemes" ADD CONSTRAINT "_AnimeThemes_B_fkey" FOREIGN KEY ("B") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MangaThemes" ADD CONSTRAINT "_MangaThemes_A_fkey" FOREIGN KEY ("A") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MangaThemes" ADD CONSTRAINT "_MangaThemes_B_fkey" FOREIGN KEY ("B") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LightNovelThemes" ADD CONSTRAINT "_LightNovelThemes_A_fkey" FOREIGN KEY ("A") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LightNovelThemes" ADD CONSTRAINT "_LightNovelThemes_B_fkey" FOREIGN KEY ("B") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MangaGenres" ADD CONSTRAINT "_MangaGenres_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MangaGenres" ADD CONSTRAINT "_MangaGenres_B_fkey" FOREIGN KEY ("B") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LightNovelGenres" ADD CONSTRAINT "_LightNovelGenres_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LightNovelGenres" ADD CONSTRAINT "_LightNovelGenres_B_fkey" FOREIGN KEY ("B") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MangaAuthors" ADD CONSTRAINT "_MangaAuthors_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MangaAuthors" ADD CONSTRAINT "_MangaAuthors_B_fkey" FOREIGN KEY ("B") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LightNovelAuthors" ADD CONSTRAINT "_LightNovelAuthors_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LightNovelAuthors" ADD CONSTRAINT "_LightNovelAuthors_B_fkey" FOREIGN KEY ("B") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
