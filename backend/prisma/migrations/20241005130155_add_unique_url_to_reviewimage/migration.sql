/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `ReviewImage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReviewImage_url_key" ON "ReviewImage"("url");
