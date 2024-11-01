/*
  Warnings:

  - You are about to drop the `_AnimeToStudio` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AnimeToStudio" DROP CONSTRAINT "_AnimeToStudio_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnimeToStudio" DROP CONSTRAINT "_AnimeToStudio_B_fkey";

-- DropTable
DROP TABLE "_AnimeToStudio";

-- CreateTable
CREATE TABLE "_AnimeStudios" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AnimeStudios_AB_unique" ON "_AnimeStudios"("A", "B");

-- CreateIndex
CREATE INDEX "_AnimeStudios_B_index" ON "_AnimeStudios"("B");

-- AddForeignKey
ALTER TABLE "_AnimeStudios" ADD CONSTRAINT "_AnimeStudios_A_fkey" FOREIGN KEY ("A") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeStudios" ADD CONSTRAINT "_AnimeStudios_B_fkey" FOREIGN KEY ("B") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
