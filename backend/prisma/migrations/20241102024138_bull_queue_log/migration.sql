-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('QUEUED', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "QueueLog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "status" "QueueStatus" NOT NULL,
    "data" JSONB NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QueueLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QueueLog_jobId_key" ON "QueueLog"("jobId");
