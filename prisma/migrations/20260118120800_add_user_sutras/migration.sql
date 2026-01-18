-- AlterTable: 移除全局唯一约束,添加用户所有权字段
ALTER TABLE "Sutra" DROP CONSTRAINT IF EXISTS "Sutra_title_key";

-- AlterTable: 添加新字段
ALTER TABLE "Sutra" ADD COLUMN "userId" TEXT;
ALTER TABLE "Sutra" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- 将所有现有佛经标记为公共佛经
UPDATE "Sutra" SET "isPublic" = true, "userId" = NULL WHERE "userId" IS NULL;

-- AddForeignKey: 添加外键约束
ALTER TABLE "Sutra" ADD CONSTRAINT "Sutra_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex: 添加索引
CREATE INDEX "Sutra_userId_isPublic_idx" ON "Sutra"("userId", "isPublic");

-- CreateIndex: 添加用户级唯一约束
CREATE UNIQUE INDEX "Sutra_userId_title_key" ON "Sutra"("userId", "title");
