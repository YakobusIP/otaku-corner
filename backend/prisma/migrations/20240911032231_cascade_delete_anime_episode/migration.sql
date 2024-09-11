-- DropForeignKey
ALTER TABLE "AnimeEpisode" DROP CONSTRAINT "AnimeEpisode_animeId_fkey";

-- AddForeignKey
ALTER TABLE "AnimeEpisode" ADD CONSTRAINT "AnimeEpisode_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
