-- CreateEnum
CREATE TYPE "ImageVaultSafetyLevel" AS ENUM ('SAFE', 'NSFW', 'EXPLICIT');

-- AlterTable
ALTER TABLE "ImageVaultEntry" ADD COLUMN "safetyLevel" "ImageVaultSafetyLevel" NOT NULL DEFAULT 'SAFE',
ADD COLUMN "safetyReason" TEXT;

-- Backfill from legacy explicit fields
UPDATE "ImageVaultEntry"
SET
  "safetyLevel" = CASE
    WHEN "isExplicit" = true THEN 'EXPLICIT'::"ImageVaultSafetyLevel"
    ELSE 'SAFE'::"ImageVaultSafetyLevel"
  END,
  "safetyReason" = "explicitReason";

-- CreateIndex
CREATE INDEX "ImageVaultEntry_safetyLevel_idx" ON "ImageVaultEntry"("safetyLevel");
