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
    }),
    db.taskLog.findMany({
      where: { userId, createdAt: { gte: eightyFourDaysAgo } },
      include: { task: true },
    }),
    db.journalEntry.findMany({
      where: { userId, createdAt: { gte: eightyFourDaysAgo } },
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
  const allLogs = await db.taskLog.findMany({
    where: { userId },
    include: { task: true }
  });

  // 按任务聚合历史日志
  const allTimeMap = new Map<string, { id: string; text: string; count: number; type: string }>();
  
  allLogs.forEach(log => {
    const existing = allTimeMap.get(log.taskId);
    if (existing) {
      existing.count += log.count;
    } else {
      allTimeMap.set(log.taskId, {
        id: log.taskId,
        text: log.task.text,
        count: log.count,
        type: log.task.type
      });
    }
  });

  const allTimeStats = Array.from(allTimeMap.values()).sort((a, b) => b.count - a.count);

  // 2. 获取今日统计数据（来自 TaskLog）
  const todayLogs = await db.taskLog.findMany({
    where: { 
      userId,
      createdAt: { gte: today }
    },
    include: { task: true }
  });

  // 按任务聚合今日日志
  const todayMap = new Map<string, { id: string; text: string; count: number; type: string }>();
  
  todayLogs.forEach(log => {
    const existing = todayMap.get(log.taskId);
    if (existing) {
      existing.count += log.count;
    } else {
      todayMap.set(log.taskId, {
        id: log.taskId,
        text: log.task.text,
        count: log.count,
        type: log.task.type
      });
    }
  });

  const todayStats = Array.from(todayMap.values()).sort((a, b) => b.count - a.count);

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
      type: 'meditation'
    });
  }

  if (todayMeditationMins > 0) {
    todayStats.unshift({
      id: 'meditation-today',
      text: '静坐冥想',
      count: todayMeditationMins,
      type: 'meditation'
    });
  }

  return { today: todayStats, allTime: allTimeStats };
}
