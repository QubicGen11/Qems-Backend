/*
  Warnings:

  - You are about to drop the column `About` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `LinkedIn` on the `Employee` table. All the data in the column will be lost.
  - The `dob` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "About",
DROP COLUMN "LinkedIn",
ADD COLUMN     "about" TEXT,
ADD COLUMN     "linkedin" TEXT,
DROP COLUMN "dob",
ADD COLUMN     "dob" TIMESTAMP(3);
