-- CreateTable
CREATE TABLE "ReviewImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "animeId" INTEGER,
    "mangaId" INTEGER,
    "lightNovelId" INTEGER,

    CONSTRAINT "ReviewImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
