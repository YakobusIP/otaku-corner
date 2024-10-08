/*
  Warnings:

  - Added the required column `hostname` to the `RequestLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip` to the `RequestLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequestLog" ADD COLUMN     "hostname" TEXT NOT NULL,
ADD COLUMN     "ip" TEXT NOT NULL;
