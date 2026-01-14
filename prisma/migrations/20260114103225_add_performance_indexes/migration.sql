/*
  Warnings:

  - The required column `id` was added to the `VerificationToken` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "JournalEntry" ALTER COLUMN "tags" DROP NOT NULL,
ALTER COLUMN "tags" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_createdAt_idx" ON "JournalEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MeditationSession_userId_createdAt_idx" ON "MeditationSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SpiritualTask_userId_isDaily_updatedAt_idx" ON "SpiritualTask"("userId", "isDaily", "updatedAt");

-- CreateIndex
CREATE INDEX "TaskLog_userId_createdAt_idx" ON "TaskLog"("userId", "createdAt");
