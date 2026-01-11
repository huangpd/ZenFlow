-- AlterTable
ALTER TABLE "Sutra" ADD COLUMN     "defaultStep" INTEGER DEFAULT 1,
ADD COLUMN     "defaultTarget" INTEGER DEFAULT 1,
ADD COLUMN     "iconId" TEXT DEFAULT 'book',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'sutra',
ALTER COLUMN "content" DROP NOT NULL;
