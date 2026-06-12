/*
  Warnings:

  - You are about to drop the `ErrorLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QueueLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ErrorLog";

-- DropTable
DROP TABLE "QueueLog";

-- DropTable
DROP TABLE "RequestLog";

-- DropEnum
DROP TYPE "ErrorType";

-- DropEnum
DROP TYPE "QueueStatus";
