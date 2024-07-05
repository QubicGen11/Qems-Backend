/*
  Warnings:

  - You are about to drop the column `teamLead` on the `Employee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teamLeadId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "Department" TEXT,
ADD COLUMN     "employeeImage" TEXT,
ADD COLUMN     "employeeName" TEXT,
ADD COLUMN     "joinDate" TIMESTAMP(3),
ALTER COLUMN "companyEmail" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "teamLead",
ADD COLUMN     "isTeamLead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teamName" TEXT;

-- AlterTable
ALTER TABLE "employeeLeaves" ADD COLUMN     "employee_id" TEXT,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "Duration" DROP NOT NULL,
ALTER COLUMN "Reason" DROP NOT NULL,
ALTER COLUMN "Comments" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "leaveBalanceId" SERIAL NOT NULL,
    "employee_id" TEXT,
    "companyEmail" TEXT,
    "department" TEXT,
    "totalLeaves" INTEGER NOT NULL DEFAULT 25,
    "acceptedLeaves" INTEGER NOT NULL DEFAULT 0,
    "rejectedLeaves" INTEGER NOT NULL DEFAULT 0,
    "expiredLeaves" INTEGER NOT NULL DEFAULT 0,
    "carryOverLeaves" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("leaveBalanceId")
);

-- CreateTable
CREATE TABLE "LeaveType" (
    "id" SERIAL NOT NULL,
    "LeaveName" TEXT,
    "Type" TEXT,
    "LeaveUnit" TEXT,
    "Status" TEXT,
    "Note" TEXT,

    CONSTRAINT "LeaveType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teamMember" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaveType_LeaveName_key" ON "LeaveType"("LeaveName");

-- CreateIndex
CREATE UNIQUE INDEX "teamMember_teamId_employeeId_key" ON "teamMember"("teamId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_teamLeadId_key" ON "Team"("teamLeadId");

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_teamLeadId_fkey" FOREIGN KEY ("teamLeadId") REFERENCES "Employee"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employeeLeaves" ADD CONSTRAINT "employeeLeaves_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;
