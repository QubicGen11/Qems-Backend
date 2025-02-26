-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminAccess" TEXT[] DEFAULT ARRAY[]::TEXT[];
