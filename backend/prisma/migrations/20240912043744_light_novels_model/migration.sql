-- CreateTable
CREATE TABLE "LightNovel" (
    "id" SERIAL NOT NULL,
    "malId" INTEGER NOT NULL,
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

    CONSTRAINT "LightNovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LightNovelThemes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_LightNovelGenres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_LightNovelAuthors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LightNovel_malId_key" ON "LightNovel"("malId");

-- CreateIndex
CREATE UNIQUE INDEX "_LightNovelThemes_AB_unique" ON "_LightNovelThemes"("A", "B");

-- CreateIndex
CREATE INDEX "_LightNovelThemes_B_index" ON "_LightNovelThemes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LightNovelGenres_AB_unique" ON "_LightNovelGenres"("A", "B");

-- CreateIndex
CREATE INDEX "_LightNovelGenres_B_index" ON "_LightNovelGenres"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LightNovelAuthors_AB_unique" ON "_LightNovelAuthors"("A", "B");

-- CreateIndex
CREATE INDEX "_LightNovelAuthors_B_index" ON "_LightNovelAuthors"("B");

-- AddForeignKey
ALTER TABLE "_LightNovelThemes" ADD CONSTRAINT "_LightNovelThemes_A_fkey" FOREIGN KEY ("A") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LightNovelThemes" ADD CONSTRAINT "_LightNovelThemes_B_fkey" FOREIGN KEY ("B") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LightNovelGenres" ADD CONSTRAINT "_LightNovelGenres_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LightNovelGenres" ADD CONSTRAINT "_LightNovelGenres_B_fkey" FOREIGN KEY ("B") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LightNovelAuthors" ADD CONSTRAINT "_LightNovelAuthors_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LightNovelAuthors" ADD CONSTRAINT "_LightNovelAuthors_B_fkey" FOREIGN KEY ("B") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
