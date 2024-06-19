/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `BankDetail` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BankDetail_email_key" ON "BankDetail"("email");
