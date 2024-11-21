-- DropForeignKey
ALTER TABLE "LightNovelVolumes" DROP CONSTRAINT "LightNovelVolumes_lightNovelId_fkey";

-- AddForeignKey
ALTER TABLE "LightNovelVolumes" ADD CONSTRAINT "LightNovelVolumes_lightNovelId_fkey" FOREIGN KEY ("lightNovelId") REFERENCES "LightNovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
