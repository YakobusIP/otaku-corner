-- DropForeignKey
ALTER TABLE "AnimeGenres" DROP CONSTRAINT "AnimeGenres_animeId_fkey";

-- DropForeignKey
ALTER TABLE "AnimeGenres" DROP CONSTRAINT "AnimeGenres_genreId_fkey";

-- DropForeignKey
ALTER TABLE "AnimeStudios" DROP CONSTRAINT "AnimeStudios_animeId_fkey";

-- DropForeignKey
ALTER TABLE "AnimeStudios" DROP CONSTRAINT "AnimeStudios_studioId_fkey";

-- DropForeignKey
ALTER TABLE "AnimeThemes" DROP CONSTRAINT "AnimeThemes_animeId_fkey";

-- DropForeignKey
ALTER TABLE "AnimeThemes" DROP CONSTRAINT "AnimeThemes_themeId_fkey";

-- DropForeignKey
ALTER TABLE "LightNovelAuthors" DROP CONSTRAINT "LightNovelAuthors_authorId_fkey";

-- DropForeignKey
ALTER TABLE "LightNovelAuthors" DROP CONSTRAINT "LightNovelAuthors_lightNovelId_fkey";

-- DropForeignKey
ALTER TABLE "LightNovelGenres" DROP CONSTRAINT "LightNovelGenres_genreId_fkey";

-- DropForeignKey
ALTER TABLE "LightNovelGenres" DROP CONSTRAINT "LightNovelGenres_lightNovelId_fkey";

-- DropForeignKey
ALTER TABLE "LightNovelThemes" DROP CONSTRAINT "LightNovelThemes_lightNovelId_fkey";

-- DropForeignKey
ALTER TABLE "LightNovelThemes" DROP CONSTRAINT "LightNovelThemes_themeId_fkey";

-- DropForeignKey
ALTER TABLE "MangaAuthors" DROP CONSTRAINT "MangaAuthors_authorId_fkey";

-- DropForeignKey
ALTER TABLE "MangaAuthors" DROP CONSTRAINT "MangaAuthors_mangaId_fkey";

-- DropForeignKey
ALTER TABLE "MangaGenres" DROP CONSTRAINT "MangaGenres_genreId_fkey";

-- DropForeignKey
ALTER TABLE "MangaGenres" DROP CONSTRAINT "MangaGenres_mangaId_fkey";

-- DropForeignKey
ALTER TABLE "MangaThemes" DROP CONSTRAINT "MangaThemes_mangaId_fkey";

-- DropForeignKey
ALTER TABLE "MangaThemes" DROP CONSTRAINT "MangaThemes_themeId_fkey";

-- AddForeignKey
ALTER TABLE "AnimeGenres" ADD CONSTRAINT "AnimeGenres_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeGenres" ADD CONSTRAINT "AnimeGenres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaGenres" ADD CONSTRAINT "MangaGenres_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaGenres" ADD CONSTRAINT "MangaGenres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelGenres" ADD CONSTRAINT "LightNovelGenres_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelGenres" ADD CONSTRAINT "LightNovelGenres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeStudios" ADD CONSTRAINT "AnimeStudios_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeStudios" ADD CONSTRAINT "AnimeStudios_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeThemes" ADD CONSTRAINT "AnimeThemes_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeThemes" ADD CONSTRAINT "AnimeThemes_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaThemes" ADD CONSTRAINT "MangaThemes_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaThemes" ADD CONSTRAINT "MangaThemes_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelThemes" ADD CONSTRAINT "LightNovelThemes_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelThemes" ADD CONSTRAINT "LightNovelThemes_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaAuthors" ADD CONSTRAINT "MangaAuthors_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaAuthors" ADD CONSTRAINT "MangaAuthors_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelAuthors" ADD CONSTRAINT "LightNovelAuthors_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelAuthors" ADD CONSTRAINT "LightNovelAuthors_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;
