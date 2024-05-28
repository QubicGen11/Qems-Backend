/*
  Warnings:

  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `position` on the `User` table. All the data in the column will be lost.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Employee', 'Admin', 'Intern', 'Manager');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Active', 'Disabled');

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "Salary" DROP CONSTRAINT "Salary_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "employeeProjects" DROP CONSTRAINT "employeeProjects_employee_id_fkey";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "about" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "skills" TEXT,
ALTER COLUMN "employee_id" SET DATA TYPE TEXT,
ALTER COLUMN "checkout_Time" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_pkey",
ADD COLUMN     "About" TEXT,
ADD COLUMN     "LinkedIn" TEXT,
ALTER COLUMN "employee_id" DROP DEFAULT,
ALTER COLUMN "employee_id" SET DATA TYPE TEXT,
ALTER COLUMN "dob" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("employee_id");
DROP SEQUENCE "Employee_employee_id_seq";

-- AlterTable
ALTER TABLE "Salary" ALTER COLUMN "employee_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "position",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE "employeeProjects" ALTER COLUMN "employee_id" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "EmployeeIdTracker" (
    "id" SERIAL NOT NULL,
    "last_used_number" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EmployeeIdTracker_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employeeProjects" ADD CONSTRAINT "employeeProjects_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;
