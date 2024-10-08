/*
  Warnings:

  - The values [WATCHING] on the enum `ProgressStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProgressStatus_new" AS ENUM ('PLANNED', 'ON_HOLD', 'ON_PROGRESS', 'COMPLETED', 'DROPPED');
ALTER TABLE "Anime" ALTER COLUMN "progressStatus" DROP DEFAULT;
ALTER TABLE "LightNovel" ALTER COLUMN "progressStatus" DROP DEFAULT;
ALTER TABLE "Manga" ALTER COLUMN "progressStatus" DROP DEFAULT;
ALTER TABLE "Anime" ALTER COLUMN "progressStatus" TYPE "ProgressStatus_new" USING ("progressStatus"::text::"ProgressStatus_new");
ALTER TABLE "Manga" ALTER COLUMN "progressStatus" TYPE "ProgressStatus_new" USING ("progressStatus"::text::"ProgressStatus_new");
ALTER TABLE "LightNovel" ALTER COLUMN "progressStatus" TYPE "ProgressStatus_new" USING ("progressStatus"::text::"ProgressStatus_new");
ALTER TYPE "ProgressStatus" RENAME TO "ProgressStatus_old";
ALTER TYPE "ProgressStatus_new" RENAME TO "ProgressStatus";
DROP TYPE "ProgressStatus_old";
ALTER TABLE "Anime" ALTER COLUMN "progressStatus" SET DEFAULT 'PLANNED';
ALTER TABLE "LightNovel" ALTER COLUMN "progressStatus" SET DEFAULT 'PLANNED';
ALTER TABLE "Manga" ALTER COLUMN "progressStatus" SET DEFAULT 'PLANNED';
COMMIT;
