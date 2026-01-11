import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始深度清理修行数据...');

  // 1. 删除所有修持日志
  const deleteLogs = await prisma.taskLog.deleteMany({});
  console.log(`已删除 ${deleteLogs.count} 条修持日志。`);

  // 2. 删除所有冥想记录
  const deleteMeds = await prisma.meditationSession.deleteMany({});
  console.log(`已删除 ${deleteMeds.count} 条冥想记录。`);

  // 3. 重置所有功课进度
  const resetTasks = await prisma.spiritualTask.updateMany({
    data: {
      current: 0,
      completed: false,
    },
  });
  console.log(`已重置 ${resetTasks.count} 项功课的进度。`);

  console.log('清理完成。');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
