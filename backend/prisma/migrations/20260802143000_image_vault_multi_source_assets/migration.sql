-- CreateTable
CREATE TABLE "ImageVaultEntrySourceAsset" (
    "imageVaultEntryId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageVaultEntrySourceAsset_pkey" PRIMARY KEY ("imageVaultEntryId","assetId")
);

-- Migrate existing single sourceAssetId rows into the join table
INSERT INTO "ImageVaultEntrySourceAsset" ("imageVaultEntryId", "assetId", "sortOrder", "createdAt")
SELECT "id", "sourceAssetId", 0, CURRENT_TIMESTAMP
FROM "ImageVaultEntry"
WHERE "sourceAssetId" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ImageVaultEntrySourceAsset_assetId_key" ON "ImageVaultEntrySourceAsset"("assetId");

-- CreateIndex
CREATE INDEX "ImageVaultEntrySourceAsset_imageVaultEntryId_sortOrder_idx" ON "ImageVaultEntrySourceAsset"("imageVaultEntryId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ImageVaultEntrySourceAsset" ADD CONSTRAINT "ImageVaultEntrySourceAsset_imageVaultEntryId_fkey" FOREIGN KEY ("imageVaultEntryId") REFERENCES "ImageVaultEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageVaultEntrySourceAsset" ADD CONSTRAINT "ImageVaultEntrySourceAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "ImageVaultEntry" DROP CONSTRAINT "ImageVaultEntry_sourceAssetId_fkey";

-- DropIndex
DROP INDEX "ImageVaultEntry_sourceAssetId_key";

-- AlterTable
ALTER TABLE "ImageVaultEntry" DROP COLUMN "sourceAssetId";
