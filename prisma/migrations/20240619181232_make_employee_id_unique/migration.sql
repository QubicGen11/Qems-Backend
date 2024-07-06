/*
  Warnings:

  - You are about to drop the column `email` on the `BankDetail` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employee_id]` on the table `BankDetail` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employee_id` to the `BankDetail` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BankDetail_email_key";

-- AlterTable
ALTER TABLE "BankDetail" DROP COLUMN "email",
ADD COLUMN     "employee_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BankDetail_employee_id_key" ON "BankDetail"("employee_id");
