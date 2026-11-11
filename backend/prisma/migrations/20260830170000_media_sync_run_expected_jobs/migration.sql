-- Durable run completion: compare terminal MediaSyncItem rows to expected queue jobs.
ALTER TABLE "MediaSyncRun" ADD COLUMN "expectedJobCount" INTEGER;
