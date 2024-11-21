/*
  Warnings:

  - You are about to drop the column `consumedAt` on the `LightNovelReview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LightNovelReview" DROP COLUMN "consumedAt";

-- CreateTable
CREATE TABLE "LightNovelVolumes" (
    "id" TEXT NOT NULL,
    "volumeNumber" INTEGER NOT NULL,
    "consumedAt" DATE,
    "lightNovelId" TEXT NOT NULL,

    CONSTRAINT "LightNovelVolumes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LightNovelVolumes_lightNovelId_key" ON "LightNovelVolumes"("lightNovelId");

-- AddForeignKey
ALTER TABLE "LightNovelVolumes" ADD CONSTRAINT "LightNovelVolumes_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
