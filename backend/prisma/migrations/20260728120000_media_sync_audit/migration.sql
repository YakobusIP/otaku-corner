-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "AuditSource" AS ENUM ('ADMIN', 'SYNC', 'CREATE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MediaSyncRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MediaSyncRunType" AS ENUM ('SCHEDULED', 'MANUAL');

-- CreateEnum
CREATE TYPE "MediaSyncMediaType" AS ENUM ('ANIME', 'MANGA', 'LIGHT_NOVEL');

-- CreateEnum
CREATE TYPE "MediaSyncItemOutcome" AS ENUM ('UPDATED', 'UNCHANGED', 'CONFLICT', 'FAILED');

-- AlterTable
ALTER TABLE "Anime" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Manga" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LightNovel" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Anime_deletedAt_idx" ON "Anime"("deletedAt");

-- CreateIndex
CREATE INDEX "Manga_deletedAt_idx" ON "Manga"("deletedAt");

-- CreateIndex
CREATE INDEX "LightNovel_deletedAt_idx" ON "LightNovel"("deletedAt");

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "AuditAction" NOT NULL,
    "source" "AuditSource" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorUserId" INTEGER,
    "syncRunId" TEXT,
    "before" JSONB,
    "after" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaSyncRun" (
    "id" TEXT NOT NULL,
    "type" "MediaSyncRunType" NOT NULL,
    "status" "MediaSyncRunStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "touchedCount" INTEGER NOT NULL DEFAULT 0,
    "updatedCount" INTEGER NOT NULL DEFAULT 0,
    "unchangedCount" INTEGER NOT NULL DEFAULT 0,
    "conflictedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaSyncItem" (
    "id" TEXT NOT NULL,
    "syncRunId" TEXT NOT NULL,
    "mediaType" "MediaSyncMediaType" NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "mediaTitle" TEXT,
    "outcome" "MediaSyncItemOutcome" NOT NULL,
    "errorMessage" TEXT,
    "conflicts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaSyncItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_id_idx" ON "AuditLog"("createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_syncRunId_idx" ON "AuditLog"("syncRunId");

-- CreateIndex
CREATE INDEX "MediaSyncRun_createdAt_idx" ON "MediaSyncRun"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "MediaSyncRun_status_idx" ON "MediaSyncRun"("status");

-- CreateIndex
CREATE INDEX "MediaSyncItem_syncRunId_outcome_idx" ON "MediaSyncItem"("syncRunId", "outcome");

-- CreateIndex
CREATE INDEX "MediaSyncItem_syncRunId_createdAt_idx" ON "MediaSyncItem"("syncRunId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_syncRunId_fkey" FOREIGN KEY ("syncRunId") REFERENCES "MediaSyncRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaSyncItem" ADD CONSTRAINT "MediaSyncItem_syncRunId_fkey" FOREIGN KEY ("syncRunId") REFERENCES "MediaSyncRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
