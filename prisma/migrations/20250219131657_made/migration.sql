/*
  Warnings:

  - The `assignedTo` column on the `CMSEntry` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CMSEntry" DROP COLUMN "assignedTo",
ADD COLUMN     "assignedTo" TEXT[];
