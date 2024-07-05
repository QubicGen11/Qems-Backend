/*
  Warnings:

  - You are about to drop the column `leaveDocumrnt` on the `employeeLeaves` table. All the data in the column will be lost.
  - You are about to drop the column `end_Date` on the `leaveRequests` table. All the data in the column will be lost.
  - You are about to drop the column `start_Date` on the `leaveRequests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "department" TEXT,
ADD COLUMN     "reportingManager" TEXT,
ADD COLUMN     "reportingManagerId" TEXT,
ADD COLUMN     "teamLead" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Projects" ADD COLUMN     "projectTeam" TEXT;

-- AlterTable
ALTER TABLE "employeeLeaves" DROP COLUMN "leaveDocumrnt",
ADD COLUMN     "status" TEXT;

-- AlterTable
ALTER TABLE "leaveRequests" DROP COLUMN "end_Date",
DROP COLUMN "start_Date",
ADD COLUMN     "companyEmail" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "leaveDocument" TEXT,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "teamName" TEXT,
    "description" TEXT,
    "departmentName" TEXT,
    "teamLeadId" TEXT,
    "teamLeadName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);
