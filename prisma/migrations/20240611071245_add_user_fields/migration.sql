/*
  Warnings:

  - The primary key for the `Attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `about` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `attendance_id` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `employee_id` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Attendance` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - Added the required column `companyEmail` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_employee_id_fkey";

-- DropIndex
DROP INDEX "Employee_email_key";

-- AlterTable
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_pkey",
DROP COLUMN "about",
DROP COLUMN "attendance_id",
DROP COLUMN "company",
DROP COLUMN "education",
DROP COLUMN "employee_id",
DROP COLUMN "linkedin",
DROP COLUMN "position",
DROP COLUMN "skills",
ADD COLUMN     "companyEmail" TEXT NOT NULL,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "reports" TEXT,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "checkin_Time" DROP NOT NULL,
ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "companyEmail" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "employeeImg" TEXT,
ADD COLUMN     "skills" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "position" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "joiningDate" TIMESTAMP(3),
ADD COLUMN     "mainPosition" TEXT,
ADD COLUMN     "salary" DOUBLE PRECISION,
ALTER COLUMN "role" DROP NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("email");

-- AlterTable
ALTER TABLE "leaveRequests" ALTER COLUMN "employee_id" DROP NOT NULL,
ALTER COLUMN "employee_id" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "employeeLeaves" (
    "id" SERIAL NOT NULL,
    "leaveType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "Duration" TEXT NOT NULL,
    "leaveDocumrnt" TEXT,
    "Reason" TEXT NOT NULL,
    "Comments" TEXT NOT NULL,

    CONSTRAINT "employeeLeaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employeeReports" (
    "id" SERIAL NOT NULL,
    "employeeId" TEXT,
    "employeeEmail" TEXT,
    "report" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employeeReports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaveRequests" ADD CONSTRAINT "leaveRequests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employeeReports" ADD CONSTRAINT "employeeReports_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;
