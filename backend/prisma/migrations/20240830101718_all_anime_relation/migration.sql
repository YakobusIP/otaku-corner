-- CreateTable
CREATE TABLE "Anime" (
    "id" SERIAL NOT NULL,
    "malId" INTEGER NOT NULL,
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
    "synopsis" TEXT NOT NULL,
    "trailer" TEXT,
    "malUrl" TEXT NOT NULL,
    "review" TEXT,
    "storylineRating" INTEGER,
    "qualityRating" INTEGER,
    "voiceActingRating" INTEGER,
    "enjoymentRating" INTEGER,
    "personalScore" INTEGER,
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
CREATE TABLE "AnimeImages" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "largeImageUrl" TEXT,
    "smallImageUrl" TEXT,
    "animeId" INTEGER NOT NULL,

    CONSTRAINT "AnimeImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Studio" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AnimeGenres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AnimeToStudio" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AnimeThemes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Anime_malId_key" ON "Anime"("malId");

-- CreateIndex
CREATE UNIQUE INDEX "AnimeImages_animeId_key" ON "AnimeImages"("animeId");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Studio_name_key" ON "Studio"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AnimeGenres_AB_unique" ON "_AnimeGenres"("A", "B");

-- CreateIndex
CREATE INDEX "_AnimeGenres_B_index" ON "_AnimeGenres"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AnimeToStudio_AB_unique" ON "_AnimeToStudio"("A", "B");

-- CreateIndex
CREATE INDEX "_AnimeToStudio_B_index" ON "_AnimeToStudio"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AnimeThemes_AB_unique" ON "_AnimeThemes"("A", "B");

-- CreateIndex
CREATE INDEX "_AnimeThemes_B_index" ON "_AnimeThemes"("B");

-- AddForeignKey
ALTER TABLE "AnimeEpisode" ADD CONSTRAINT "AnimeEpisode_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeImages" ADD CONSTRAINT "AnimeImages_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
