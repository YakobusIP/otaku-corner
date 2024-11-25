-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('PLANNED', 'ON_HOLD', 'ON_PROGRESS', 'COMPLETED', 'DROPPED');

-- CreateEnum
CREATE TYPE "ErrorType" AS ENUM ('WARN', 'ERROR');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('QUEUED', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Anime" (
    "id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "season" TEXT,
    "title" TEXT NOT NULL,
    "titleJapanese" TEXT NOT NULL,
    "titleSynonyms" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "aired" TEXT NOT NULL,
    "broadcast" TEXT NOT NULL,
    "episodesCount" INTEGER,
    "duration" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "images" JSONB NOT NULL,
    "synopsis" TEXT NOT NULL,
    "trailer" TEXT,
    "malUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeEpisode" (
    "id" SERIAL NOT NULL,
    "aired" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleJapanese" TEXT,
    "titleRomaji" TEXT,
    "animeId" INTEGER NOT NULL,

    CONSTRAINT "AnimeEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeReview" (
    "id" SERIAL NOT NULL,
    "reviewText" TEXT,
    "storylineRating" INTEGER,
    "qualityRating" INTEGER,
    "voiceActingRating" INTEGER,
    "soundTrackRating" INTEGER,
    "charDevelopmentRating" INTEGER,
    "personalScore" DOUBLE PRECISION,
    "progressStatus" "ProgressStatus" NOT NULL DEFAULT 'PLANNED',
    "consumedAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "animeId" INTEGER NOT NULL,

    CONSTRAINT "AnimeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manga" (
    "id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleJapanese" TEXT NOT NULL,
    "titleSynonyms" TEXT NOT NULL,
    "published" TEXT NOT NULL,
    "chaptersCount" INTEGER,
    "volumesCount" INTEGER,
    "score" DOUBLE PRECISION,
    "images" JSONB NOT NULL,
    "synopsis" TEXT NOT NULL,
    "malUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MangaReview" (
    "id" SERIAL NOT NULL,
    "reviewText" TEXT,
    "storylineRating" INTEGER,
    "artStyleRating" INTEGER,
    "charDevelopmentRating" INTEGER,
    "worldBuildingRating" INTEGER,
    "originalityRating" INTEGER,
    "personalScore" DOUBLE PRECISION,
    "progressStatus" "ProgressStatus" NOT NULL DEFAULT 'PLANNED',
    "consumedAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mangaId" INTEGER NOT NULL,

    CONSTRAINT "MangaReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LightNovel" (
    "id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleJapanese" TEXT NOT NULL,
    "titleSynonyms" TEXT NOT NULL,
    "published" TEXT NOT NULL,
    "volumesCount" INTEGER,
    "score" DOUBLE PRECISION,
    "images" JSONB NOT NULL,
    "synopsis" TEXT NOT NULL,
    "malUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LightNovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LightNovelReview" (
    "id" SERIAL NOT NULL,
    "reviewText" TEXT,
    "storylineRating" INTEGER,
    "worldBuildingRating" INTEGER,
    "writingStyleRating" INTEGER,
    "charDevelopmentRating" INTEGER,
    "originalityRating" INTEGER,
    "personalScore" DOUBLE PRECISION,
    "progressStatus" "ProgressStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lightNovelId" INTEGER NOT NULL,

    CONSTRAINT "LightNovelReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LightNovelVolumes" (
    "id" SERIAL NOT NULL,
    "volumeNumber" INTEGER NOT NULL,
    "consumedAt" DATE,
    "lightNovelId" INTEGER NOT NULL,

    CONSTRAINT "LightNovelVolumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" CITEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Studio" (
    "id" SERIAL NOT NULL,
    "name" CITEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" SERIAL NOT NULL,
    "name" CITEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" CITEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeGenres" (
    "animeId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "AnimeGenres_pkey" PRIMARY KEY ("animeId","genreId")
);

-- CreateTable
CREATE TABLE "MangaGenres" (
    "mangaId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "MangaGenres_pkey" PRIMARY KEY ("mangaId","genreId")
);

-- CreateTable
CREATE TABLE "LightNovelGenres" (
    "lightNovelId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    CONSTRAINT "LightNovelGenres_pkey" PRIMARY KEY ("lightNovelId","genreId")
);

-- CreateTable
CREATE TABLE "AnimeStudios" (
    "animeId" INTEGER NOT NULL,
    "studioId" INTEGER NOT NULL,

    CONSTRAINT "AnimeStudios_pkey" PRIMARY KEY ("animeId","studioId")
);

-- CreateTable
CREATE TABLE "AnimeThemes" (
    "animeId" INTEGER NOT NULL,
    "themeId" INTEGER NOT NULL,

    CONSTRAINT "AnimeThemes_pkey" PRIMARY KEY ("animeId","themeId")
);

-- CreateTable
CREATE TABLE "MangaThemes" (
    "mangaId" INTEGER NOT NULL,
    "themeId" INTEGER NOT NULL,

    CONSTRAINT "MangaThemes_pkey" PRIMARY KEY ("mangaId","themeId")
);

-- CreateTable
CREATE TABLE "LightNovelThemes" (
    "lightNovelId" INTEGER NOT NULL,
    "themeId" INTEGER NOT NULL,

    CONSTRAINT "LightNovelThemes_pkey" PRIMARY KEY ("lightNovelId","themeId")
);

-- CreateTable
CREATE TABLE "MangaAuthors" (
    "mangaId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "MangaAuthors_pkey" PRIMARY KEY ("mangaId","authorId")
);

-- CreateTable
CREATE TABLE "LightNovelAuthors" (
    "lightNovelId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "LightNovelAuthors_pkey" PRIMARY KEY ("lightNovelId","authorId")
);

-- CreateTable
CREATE TABLE "AdminPin" (
    "id" SERIAL NOT NULL,
    "pin1" TEXT NOT NULL,
    "pin2" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminPin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "animeReviewId" INTEGER,
    "mangaReviewId" INTEGER,
    "lightNovelReviewId" INTEGER,

    CONSTRAINT "ReviewImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestLog" (
    "id" SERIAL NOT NULL,
    "hostname" TEXT NOT NULL,
    "ip" TEXT,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "headers" JSONB NOT NULL,
    "body" JSONB NOT NULL,
    "status" INTEGER NOT NULL,
    "response" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "type" "ErrorType" NOT NULL,
    "statusCode" INTEGER,
    "stack" TEXT,
    "route" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueLog" (
    "id" SERIAL NOT NULL,
    "jobId" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "status" "QueueStatus" NOT NULL,
    "data" JSONB NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QueueLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Anime_slug_key" ON "Anime"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AnimeReview_animeId_key" ON "AnimeReview"("animeId");

-- CreateIndex
CREATE UNIQUE INDEX "Manga_slug_key" ON "Manga"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MangaReview_mangaId_key" ON "MangaReview"("mangaId");

-- CreateIndex
CREATE UNIQUE INDEX "LightNovel_slug_key" ON "LightNovel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LightNovelReview_lightNovelId_key" ON "LightNovelReview"("lightNovelId");

-- CreateIndex
CREATE UNIQUE INDEX "LightNovelVolumes_volumeNumber_lightNovelId_key" ON "LightNovelVolumes"("volumeNumber", "lightNovelId");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Studio_name_key" ON "Studio"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Author_name_key" ON "Author"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewImage_url_key" ON "ReviewImage"("url");

-- CreateIndex
CREATE UNIQUE INDEX "QueueLog_jobId_key" ON "QueueLog"("jobId");

-- AddForeignKey
ALTER TABLE "AnimeEpisode" ADD CONSTRAINT "AnimeEpisode_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeReview" ADD CONSTRAINT "AnimeReview_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaReview" ADD CONSTRAINT "MangaReview_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelReview" ADD CONSTRAINT "LightNovelReview_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightNovelVolumes" ADD CONSTRAINT "LightNovelVolumes_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_animeReviewId_fkey" FOREIGN KEY ("animeReviewId") REFERENCES "AnimeReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_mangaReviewId_fkey" FOREIGN KEY ("mangaReviewId") REFERENCES "MangaReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_lightNovelReviewId_fkey" FOREIGN KEY ("lightNovelReviewId") REFERENCES "LightNovelReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
