-- CreateTable
CREATE TABLE "Manga" (
    "id" SERIAL NOT NULL,
    "malId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
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
    "review" TEXT,
    "storylineRating" INTEGER,
    "qualityRating" INTEGER,
    "enjoymentRating" INTEGER,
    "personalScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MangaThemes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_MangaGenres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_MangaAuthors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Manga_malId_key" ON "Manga"("malId");

-- CreateIndex
CREATE UNIQUE INDEX "Author_name_key" ON "Author"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_MangaThemes_AB_unique" ON "_MangaThemes"("A", "B");

-- CreateIndex
CREATE INDEX "_MangaThemes_B_index" ON "_MangaThemes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MangaGenres_AB_unique" ON "_MangaGenres"("A", "B");

-- CreateIndex
CREATE INDEX "_MangaGenres_B_index" ON "_MangaGenres"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MangaAuthors_AB_unique" ON "_MangaAuthors"("A", "B");

-- CreateIndex
CREATE INDEX "_MangaAuthors_B_index" ON "_MangaAuthors"("B");

-- AddForeignKey
ALTER TABLE "_MangaThemes" ADD CONSTRAINT "_MangaThemes_A_fkey" FOREIGN KEY ("A") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MangaThemes" ADD CONSTRAINT "_MangaThemes_B_fkey" FOREIGN KEY ("B") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MangaGenres" ADD CONSTRAINT "_MangaGenres_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MangaGenres" ADD CONSTRAINT "_MangaGenres_B_fkey" FOREIGN KEY ("B") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MangaAuthors" ADD CONSTRAINT "_MangaAuthors_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MangaAuthors" ADD CONSTRAINT "_MangaAuthors_B_fkey" FOREIGN KEY ("B") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;
