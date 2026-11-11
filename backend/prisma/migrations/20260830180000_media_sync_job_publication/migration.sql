-- Durable queue publication outbox for ambiguous Bull enqueue acknowledgments.
CREATE TYPE "MediaSyncJobPublicationStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED');

CREATE TABLE "MediaSyncJobPublication" (
    "id" TEXT NOT NULL,
    "syncRunId" TEXT NOT NULL,
    "mediaType" "MediaSyncMediaType" NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "bullJobId" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "status" "MediaSyncJobPublicationStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "publishedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaSyncJobPublication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaSyncJobPublication_syncRunId_mediaType_mediaId_key" ON "MediaSyncJobPublication"("syncRunId", "mediaType", "mediaId");

CREATE UNIQUE INDEX "MediaSyncJobPublication_bullJobId_key" ON "MediaSyncJobPublication"("bullJobId");

CREATE INDEX "MediaSyncJobPublication_status_updatedAt_idx" ON "MediaSyncJobPublication"("status", "updatedAt");

CREATE INDEX "MediaSyncJobPublication_syncRunId_status_idx" ON "MediaSyncJobPublication"("syncRunId", "status");

ALTER TABLE "MediaSyncJobPublication" ADD CONSTRAINT "MediaSyncJobPublication_syncRunId_fkey" FOREIGN KEY ("syncRunId") REFERENCES "MediaSyncRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
