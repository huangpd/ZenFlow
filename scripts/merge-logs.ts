import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting log merge process...');

    // 1. 获取所有日志
    // 注意：如果数据量巨大，这里应该分页处理。对于当前规模，一次性获取尚可。
    const allLogs = await prisma.taskLog.findMany({
        orderBy: { createdAt: 'asc' }
    });

    console.log(`Found ${allLogs.length} total log entries.`);

    // 2. 在内存中按 (userId + taskId + date) 分组
    // map key: "userId_taskId_dateString"
    const groups = new Map<string, typeof allLogs>();

    for (const log of allLogs) {
        const dateStr = log.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
        const key = `${log.userId}_${log.taskId}_${dateStr}`;

        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(log);
    }

    console.log(`Found ${groups.size} unique (user, task, day) groups.`);

    let mergedGroupsCount = 0;
    let deletedLogsCount = 0;

    // 3. 遍历分组，合并数据
    for (const [key, logs] of groups) {
        if (logs.length <= 1) continue; // 只有一条或是空的，不需要合并

        mergedGroupsCount++;
        console.log(`Merging group ${key} with ${logs.length} entries...`);

        // 计算总数
        const totalCount = logs.reduce((sum, log) => sum + log.count, 0);

        // 保留第一条（最早的），更新它的 count
        const [firstLog, ...restLogs] = logs;

        // 更新第一条
        await prisma.taskLog.update({
            where: { id: firstLog.id },
            data: { count: totalCount }
        });

        // 删除其余的
        const idsToDelete = restLogs.map(l => l.id);
        await prisma.taskLog.deleteMany({
            where: { id: { in: idsToDelete } }
        });

        deletedLogsCount += idsToDelete.length;
    }

    console.log('-----------------------------------');
    console.log(`Merge Complete.`);
    console.log(`Groups processed: ${groups.size}`);
    console.log(`Groups merged: ${mergedGroupsCount}`);
    console.log(`Redundant logs deleted: ${deletedLogsCount}`);
    console.log(`Remaining logs: ${allLogs.length - deletedLogsCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
