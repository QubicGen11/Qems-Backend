-- AlterTable
ALTER TABLE "BankDetail" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CMSEntry" ADD COLUMN     "callStatus" "CallStatus",
ADD COLUMN     "status" "FollowUpStatus";
