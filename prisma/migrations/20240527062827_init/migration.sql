-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "firstname" DROP NOT NULL,
ALTER COLUMN "lastname" DROP NOT NULL,
ALTER COLUMN "dob" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "hireDate" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "leaveRequests" (
    "leave_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "leaveType" TEXT NOT NULL,
    "start_Date" TIMESTAMP(3) NOT NULL,
    "end_Date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaveRequests_pkey" PRIMARY KEY ("leave_id")
);

-- CreateTable
CREATE TABLE "Salary" (
    "salary_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "start_Date" TIMESTAMP(3) NOT NULL,
    "end_Date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salary_pkey" PRIMARY KEY ("salary_id")
);

-- CreateTable
CREATE TABLE "Projects" (
    "project_id" SERIAL NOT NULL,
    "project_Name" TEXT NOT NULL,
    "start_Date" TIMESTAMP(3) NOT NULL,
    "end_Date" TIMESTAMP(3) NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "manager_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projects_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "employeeProjects" (
    "employee_project_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "start_Date" TIMESTAMP(3) NOT NULL,
    "end_Date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employeeProjects_pkey" PRIMARY KEY ("employee_project_id")
);

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employeeProjects" ADD CONSTRAINT "employeeProjects_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employeeProjects" ADD CONSTRAINT "employeeProjects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Projects"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;
