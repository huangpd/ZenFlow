'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function getPracticeStats() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  // Fetch all relevant data for the last 84 days
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

  // Aggregate by date
  const stats: Record<string, any> = {};

  for (let i = 0; i < 84; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (83 - i));
    const dateStr = date.toLocaleDateString();
    
    const dayMeds = meditations.filter(m => m.createdAt.toLocaleDateString() === dateStr);
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
      dailyTasks: dayTaskLogs, // Note: This is now logs, not task definitions
      dailyLogs: dayLogs
    };
  }

  return Object.values(stats);
}

export async function getDetailedTaskStats() {
  const session = await auth();
  if (!session?.user?.id) return { today: [], allTime: [] };

  const userId = session.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Get All Time Stats (from SpiritualTask)
  const allTasks = await db.spiritualTask.findMany({
    where: { userId },
    orderBy: { current: 'desc' }, // Show most practiced first
  });

  const allTimeStats = allTasks.map(t => ({
    id: t.id,
    text: t.text,
    count: t.current,
    type: t.type
  }));

  // 2. Get Today's Stats (from TaskLog)
  const todayLogs = await db.taskLog.findMany({
    where: { 
      userId,
      createdAt: { gte: today }
    },
    include: { task: true }
  });

  // Aggregate today's logs by task
  const todayMap = new Map<string, { text: string; count: number; type: string }>();
  
  todayLogs.forEach(log => {
    const existing = todayMap.get(log.taskId);
    if (existing) {
      existing.count += log.count;
    } else {
      todayMap.set(log.taskId, {
        text: log.task.text,
        count: log.count,
        type: log.task.type
      });
    }
  });

  const todayStats = Array.from(todayMap.values());

  return { today: todayStats, allTime: allTimeStats };
}
