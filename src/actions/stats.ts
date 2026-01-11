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

  const [meditations, tasks, logs] = await Promise.all([
    db.meditationSession.findMany({
      where: { userId, createdAt: { gte: eightyFourDaysAgo } },
    }),
    db.spiritualTask.findMany({
      where: { userId, updatedAt: { gte: eightyFourDaysAgo }, completed: true },
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
    const dayTasks = tasks.filter(t => t.updatedAt.toLocaleDateString() === dateStr);

    let value = 0;
    if (dayMins > 0) value += 1;
    if (dayLogs.length > 0) value += 1;
    if (dayTasks.length > 0) value += 1;
    if (dayMins > 45 || dayTasks.length > 3) value += 1;

    stats[dateStr] = {
      day: i,
      dateStr,
      fullDate: date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      value,
      meditationMins: dayMins,
      dailyTasks: dayTasks,
      dailyLogs: dayLogs
    };
  }

  return Object.values(stats);
}
