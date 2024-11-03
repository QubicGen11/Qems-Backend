-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "reportMedia" TEXT[];

-- AlterTable
ALTER TABLE "Salary" ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "start_Date" DROP NOT NULL,
ALTER COLUMN "end_Date" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;
