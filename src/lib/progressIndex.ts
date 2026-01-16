// Pure calculation function for progress index - not a Server Action
export function calculateProgressIndex(
  stats: any[],
  taskStats?: { today: any[]; allTime: any[] }
): number {
  if (!stats || stats.length === 0) return 0;

  const totalDays = 84; // 总天数

  // 1. 计算活跃度（有活动的天数 / 总天数）
  const activeDays = stats.filter(
    (s) => s.meditationMins > 0 || s.dailyTasks.length > 0 || s.dailyLogs.length > 0
  ).length;
  const engagement = activeDays / totalDays;

  // 2. 计算坚持度（最大连续打卡天数 / 总天数）
  let maxStreak = 0;
  let currentStreak = 0;

  for (const day of stats) {
    if (day.meditationMins > 0 || day.dailyTasks.length > 0 || day.dailyLogs.length > 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  const persistence = maxStreak / totalDays;

  // 3. 计算强度（修持质量）
  // 3.1 坐禅时长：平均每天的分钟数，目标45分钟
  const totalMeditationMins = stats.reduce((acc, s) => acc + s.meditationMins, 0);
  const avgDailyMeditation = totalMeditationMins / totalDays;
  const meditationScore = Math.min(avgDailyMeditation / 45, 1); // 目标45分钟

  // 3.2 任务完成：平均每天的任务数，目标3个任务
  const totalTaskCount = stats.reduce((acc, s) => acc + s.dailyTasks.length, 0);
  const avgDailyTasks = totalTaskCount / totalDays;
  const taskScore = Math.min(avgDailyTasks / 3, 1); // 目标3个任务

  // 强度 = 坐禅占20% + 任务占80%
  const intensity = (meditationScore * 0.2 + taskScore * 0.8);

  // 最终公式：活跃度*0.3 + 坚持度*0.3 + 强度*0.4 = 精进指数(0-100)
  const progressIndex = (engagement * 0.3 + persistence * 0.3 + intensity * 0.4) * 100;

  return Math.round(progressIndex);
}
