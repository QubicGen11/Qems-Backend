/*
  Warnings:

  - You are about to drop the column `entryId` on the `CMSLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CMSLog" DROP CONSTRAINT "CMSLog_entryId_fkey";

-- AlterTable
ALTER TABLE "CMSLog" DROP COLUMN "entryId";

-- AlterTable
ALTER TABLE "leaveRequests" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
