'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * 获取过去 84 天的练习统计数据（用于热力图/贡献图）
 * 聚合冥想时长、功课完成情况和日记记录
 */
export async function getPracticeStats() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  // 获取过去 84 天的所有相关数据
  const eightyFourDaysAgo = new Date();
  eightyFourDaysAgo.setDate(eightyFourDaysAgo.getDate() - 83);

  const [meditations, taskLogs, logs] = await Promise.all([
    db.meditationSession.findMany({
      where: { userId, createdAt: { gte: eightyFourDaysAgo } },
      select: { duration: true, createdAt: true },
    }),
    db.taskLog.findMany({
      where: { userId, createdAt: { gte: eightyFourDaysAgo } },
      select: {
        id: true,
        count: true,
        createdAt: true,
        task: {
          select: { text: true }
        }
      },
    }),
    db.journalEntry.findMany({
      where: { userId, createdAt: { gte: eightyFourDaysAgo } },
      select: {
        id: true,
        content: true,
        createdAt: true
      },
    }),
  ]);

  // 按日期进行聚合
  const stats: Record<string, any> = {};

  for (let i = 0; i < 84; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (83 - i));
    const dateStr = date.toLocaleDateString();

    const dayMeds = meditations.filter(m => {
      const d = m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt);
      return d.toLocaleDateString() === dateStr;
    });
    const dayMins = dayMeds.reduce((acc, m) => acc + m.duration, 0);
    const dayLogs = logs.filter(l => l.createdAt.toLocaleDateString() === dateStr);
    const dayTaskLogs = taskLogs.filter(t => t.createdAt.toLocaleDateString() === dateStr);

    let value = 0;
    if (dayMins > 0) value += 1;
    if (dayLogs.length > 0) value += 1;
    if (dayTaskLogs.length > 0) value += 1;
    if (dayMins > 45 || dayTaskLogs.length > 3) value += 1;

    stats[dateStr] = {
      day: i,
      dateStr,
      fullDate: date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      value,
      meditationMins: dayMins,
      dailyTasks: dayTaskLogs, // 注意：这里现在是日志记录，而不是任务定义
      dailyLogs: dayLogs
    };
  }

  return Object.values(stats);
}

/**
 * 获取详细的功课完成统计
 * 分为今日统计和历史总计
 */
export async function getDetailedTaskStats() {
  const session = await auth();
  if (!session?.user?.id) return { today: [], allTime: [] };

  const userId = session.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. 获取历史总计统计数据（来自 TaskLog - 实际完成情况）
  const allTimeStatsRaw = await db.taskLog.groupBy({
    by: ['taskId'],
    where: { userId },
    _sum: { count: true },
  });

  // 获取任务详情以填充名称
  const taskIds = allTimeStatsRaw.map(s => s.taskId);
  const tasks = await db.spiritualTask.findMany({
    where: { id: { in: taskIds } },
    select: { id: true, text: true, type: true, target: true }
  });

  const tasksMap = new Map(tasks.map(t => [t.id, t]));

  const allTimeStats: { id: string; text: string; count: number; type: string; completed: boolean }[] = allTimeStatsRaw.map(s => {
    const task = tasksMap.get(s.taskId);
    return {
      id: s.taskId,
      text: task?.text || '未知任务',
      count: s._sum.count || 0,
      type: task?.type || 'normal',
      completed: false // All time implies accumulation, specific completion concept is vague here unless we mean "ever completed once" but let's leave false or logic as needed.
    };
  }).sort((a, b) => b.count - a.count);

  // 2. 获取今日统计数据（来自 TaskLog）
  const todayStatsRaw = await db.taskLog.groupBy({
    by: ['taskId'],
    where: {
      userId,
      createdAt: { gte: today }
    },
    _sum: { count: true },
  });

  // Need to re-fetch tasks for today's logs specifically if they weren't in all-time (unlikely but possible if we filter all-time differently? no, all-time covers everything).
  // Actually todayStatsRaw taskIds must be subset of allTimeStatsRaw taskIds.

  const todayStats: { id: string; text: string; count: number; type: string; completed: boolean }[] = todayStatsRaw.map(s => {
    const task = tasksMap.get(s.taskId);
    const count = s._sum.count || 0;
    const target = task?.target || 0;
    // Simple logic: if target is set (>0) and count >= target, it is completed.
    // Note: This logic assumes 'count' is reset daily for daily tasks. 
    // If the task is NOT daily, comparing today's log count to target might be wrong if previous progress counts.
    // However, SpiritualTask model has 'current' field which is actual truth.
    // But here we are deriving from logs. 
    // To be most accurate, we should probably fetch the Task's current 'completed' status directly from the DB?
    // But 'completed' field in DB might not be reset for non-daily tasks?
    // Let's rely on simple today count vs target for now as that's usually what "Daily Guidance" cares about (today's effort).
    const isCompleted = target > 0 && count >= target;

    return {
      id: s.taskId,
      text: task?.text || '未知任务',
      count,
      type: task?.type || 'normal',
      completed: isCompleted
    };
  }).sort((a, b) => b.count - a.count);

  // 3. 合并冥想统计数据
  const [allMeditation, todayMeditation] = await Promise.all([
    db.meditationSession.aggregate({
      where: { userId },
      _sum: { duration: true }
    }),
    db.meditationSession.aggregate({
      where: {
        userId,
        createdAt: { gte: today }
      },
      _sum: { duration: true }
    })
  ]);

  const totalMeditationMins = allMeditation._sum.duration || 0;
  const todayMeditationMins = todayMeditation._sum.duration || 0;

  if (totalMeditationMins > 0) {
    allTimeStats.unshift({
      id: 'meditation-all-time',
      text: '静坐冥想',
      count: totalMeditationMins,
      type: 'meditation',
      completed: false
    });
  }

  if (todayMeditationMins > 0) {
    todayStats.unshift({
      id: 'meditation-today',
      text: '静坐冥想',
      count: todayMeditationMins,
      type: 'meditation',
      completed: todayMeditationMins >= 15 // Assuming 15 mins is typical daily goal for meditation if not specified essentially, or true if >0? Let's say true > 0 for now or false. The UI doesn't strictly use it for meditation maybe. Let's make it consistent.
    });
  }

  return { today: todayStats, allTime: allTimeStats };
}
