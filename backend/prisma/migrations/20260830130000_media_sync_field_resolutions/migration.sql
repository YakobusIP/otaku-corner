-- AlterTable
ALTER TABLE "MediaSyncItem" ADD COLUMN "fieldResolutions" JSONB;
ALTER TABLE "MediaSyncItem" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "MediaSyncItem_syncRunId_mediaType_mediaId_idx" ON "MediaSyncItem"("syncRunId", "mediaType", "mediaId");

-- CreateIndex
CREATE INDEX "MediaSyncItem_mediaType_mediaId_outcome_idx" ON "MediaSyncItem"("mediaType", "mediaId", "outcome");
