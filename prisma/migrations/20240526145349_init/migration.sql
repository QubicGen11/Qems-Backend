-- CreateTable
CREATE TABLE "Attendance" (
    "attendance_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkin_Time" TIMESTAMP(3) NOT NULL,
    "checkout_Time" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;
