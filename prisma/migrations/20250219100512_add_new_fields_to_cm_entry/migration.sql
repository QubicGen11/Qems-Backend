-- AlterTable
ALTER TABLE "CMSEntry" ADD COLUMN     "collegeName" TEXT,
ADD COLUMN     "courseOpt" TEXT,
ADD COLUMN     "preRegisteredAmount" DECIMAL(65,30),
ADD COLUMN     "projectedAmount" DECIMAL(65,30),
ADD COLUMN     "registeredMonth" TEXT,
ADD COLUMN     "remainingAmount" DECIMAL(65,30),
ADD COLUMN     "yearOfStudying" INTEGER;
