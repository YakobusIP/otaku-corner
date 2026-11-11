-- AlterEnum
ALTER TYPE "MediaSyncItemOutcome" ADD VALUE 'RESOLVED_ACCEPTED';
ALTER TYPE "MediaSyncItemOutcome" ADD VALUE 'RESOLVED_KEPT';

-- AlterTable
ALTER TABLE "MediaSyncItem" ADD COLUMN "pendingUpstream" JSONB;
