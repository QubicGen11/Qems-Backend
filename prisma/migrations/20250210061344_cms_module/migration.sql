-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('ANSWERED', 'UNANSWERED', 'SWITCH_OFF', 'BUSY', 'NOT_REACHABLE');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('INTERESTED', 'NOT_INTERESTED', 'FOLLOW_UP', 'COMPLETE');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('CREATED', 'UPDATED', 'COMMENT_ADDED', 'STATUS_UPDATED');

-- CreateTable
CREATE TABLE "CMSEntry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "comfortableLanguage" TEXT NOT NULL,
    "callStatus" "CallStatus" NOT NULL DEFAULT 'UNANSWERED',
    "status" "FollowUpStatus" NOT NULL DEFAULT 'FOLLOW_UP',
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CMSEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CMSEntryComment" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "postedByUserId" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT NOT NULL,

    CONSTRAINT "CMSEntryComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CMSLog" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "action" "LogAction" NOT NULL,
    "performedByUserId" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CMSLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CMSEntry" ADD CONSTRAINT "CMSEntry_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CMSEntryComment" ADD CONSTRAINT "CMSEntryComment_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CMSEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CMSEntryComment" ADD CONSTRAINT "CMSEntryComment_postedByUserId_fkey" FOREIGN KEY ("postedByUserId") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CMSLog" ADD CONSTRAINT "CMSLog_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CMSEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CMSLog" ADD CONSTRAINT "CMSLog_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
