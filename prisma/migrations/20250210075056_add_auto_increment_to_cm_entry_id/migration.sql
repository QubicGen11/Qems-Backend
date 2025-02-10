/*
  Warnings:

  - The primary key for the `CMSEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `CMSEntry` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `entryId` on the `CMSEntryComment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `entryId` on the `CMSLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "CMSEntryComment" DROP CONSTRAINT "CMSEntryComment_entryId_fkey";

-- DropForeignKey
ALTER TABLE "CMSLog" DROP CONSTRAINT "CMSLog_entryId_fkey";

-- AlterTable
ALTER TABLE "CMSEntry" DROP CONSTRAINT "CMSEntry_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "CMSEntry_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "CMSEntryComment" DROP COLUMN "entryId",
ADD COLUMN     "entryId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CMSLog" DROP COLUMN "entryId",
ADD COLUMN     "entryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "CMSEntryComment" ADD CONSTRAINT "CMSEntryComment_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CMSEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CMSLog" ADD CONSTRAINT "CMSLog_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CMSEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
