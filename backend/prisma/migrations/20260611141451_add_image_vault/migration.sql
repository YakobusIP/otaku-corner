-- CreateEnum
CREATE TYPE "ImageVaultOriginType" AS ENUM ('AI', 'HUMAN');

-- CreateTable
CREATE TABLE "ImageVaultGenerationModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageVaultGenerationModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageVaultCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageVaultCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageVaultEntry" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "sourceAssetId" TEXT,
    "originType" "ImageVaultOriginType" NOT NULL,
    "sourceUrl" TEXT,
    "modelId" TEXT,
    "prompt" TEXT,
    "originalPrompt" TEXT,
    "isExplicit" BOOLEAN NOT NULL DEFAULT false,
    "explicitReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "ImageVaultEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageVaultEntryCategory" (
    "imageVaultEntryId" TEXT NOT NULL,
    "imageVaultCategoryId" TEXT NOT NULL,

    CONSTRAINT "ImageVaultEntryCategory_pkey" PRIMARY KEY ("imageVaultEntryId","imageVaultCategoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageVaultCategory_slug_key" ON "ImageVaultCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ImageVaultEntry_assetId_key" ON "ImageVaultEntry"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "ImageVaultEntry_sourceAssetId_key" ON "ImageVaultEntry"("sourceAssetId");

-- CreateIndex
CREATE INDEX "ImageVaultEntry_originType_idx" ON "ImageVaultEntry"("originType");

-- CreateIndex
CREATE INDEX "ImageVaultEntry_modelId_idx" ON "ImageVaultEntry"("modelId");

-- CreateIndex
CREATE INDEX "ImageVaultEntry_isExplicit_idx" ON "ImageVaultEntry"("isExplicit");

-- CreateIndex
CREATE INDEX "ImageVaultEntry_createdAt_idx" ON "ImageVaultEntry"("createdAt");

-- CreateIndex
CREATE INDEX "ImageVaultEntry_parentId_idx" ON "ImageVaultEntry"("parentId");

-- CreateIndex
CREATE INDEX "ImageVaultEntryCategory_imageVaultCategoryId_idx" ON "ImageVaultEntryCategory"("imageVaultCategoryId");

-- AddForeignKey
ALTER TABLE "ImageVaultEntry" ADD CONSTRAINT "ImageVaultEntry_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageVaultEntry" ADD CONSTRAINT "ImageVaultEntry_sourceAssetId_fkey" FOREIGN KEY ("sourceAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageVaultEntry" ADD CONSTRAINT "ImageVaultEntry_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ImageVaultGenerationModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageVaultEntry" ADD CONSTRAINT "ImageVaultEntry_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ImageVaultEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageVaultEntryCategory" ADD CONSTRAINT "ImageVaultEntryCategory_imageVaultEntryId_fkey" FOREIGN KEY ("imageVaultEntryId") REFERENCES "ImageVaultEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageVaultEntryCategory" ADD CONSTRAINT "ImageVaultEntryCategory_imageVaultCategoryId_fkey" FOREIGN KEY ("imageVaultCategoryId") REFERENCES "ImageVaultCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
