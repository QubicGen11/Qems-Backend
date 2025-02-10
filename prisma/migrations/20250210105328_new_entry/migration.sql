/*
  Warnings:

  - The primary key for the `CMSEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `callStatus` on the `CMSEntry` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `CMSEntry` table. All the data in the column will be lost.
  - You are about to drop the column `performedAt` on the `CMSLog` table. All the data in the column will be lost.
  - Added the required column `department` to the `CMSLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performedBy` to the `CMSLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `CMSLog` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `CMSLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "CMSEntry" DROP CONSTRAINT "CMSEntry_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "CMSEntryComment" DROP CONSTRAINT "CMSEntryComment_entryId_fkey";

-- DropForeignKey
ALTER TABLE "CMSLog" DROP CONSTRAINT "CMSLog_entryId_fkey";

-- DropForeignKey
ALTER TABLE "CMSLog" DROP CONSTRAINT "CMSLog_performedByUserId_fkey";

-- AlterTable
ALTER TABLE "CMSEntry" DROP CONSTRAINT "CMSEntry_pkey",
DROP COLUMN "callStatus",
DROP COLUMN "status",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CMSEntry_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CMSEntry_id_seq";

-- AlterTable
ALTER TABLE "CMSEntryComment" ALTER COLUMN "entryId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "CMSLog" DROP COLUMN "performedAt",
ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "details" TEXT,
ADD COLUMN     "performedBy" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "action",
ADD COLUMN     "action" TEXT NOT NULL,
ALTER COLUMN "entryId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "LeaveBalance" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "employeeReports" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "teamMember" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "CMSEntryComment" ADD CONSTRAINT "CMSEntryComment_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CMSEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CMSLog" ADD CONSTRAINT "CMSLog_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CMSEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CMSLog" ADD CONSTRAINT "CMSLog_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
