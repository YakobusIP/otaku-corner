/*
  Warnings:

  - A unique constraint covering the columns `[volumeNumber,lightNovelId]` on the table `LightNovelVolumes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LightNovelVolumes_volumeNumber_lightNovelId_key" ON "LightNovelVolumes"("volumeNumber", "lightNovelId");
