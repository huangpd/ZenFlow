'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * 保存一次静坐冥想记录
 * @param duration 时长（分钟）
 */
export async function saveMeditationSession(duration: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await db.meditationSession.create({
    data: {
      userId: session.user.id,
      duration,
    },
  });

  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * 获取用户的冥想统计信息
 * 返回总时长和所有记录列表
 */
export async function getMeditationStats() {
  const session = await auth();
  if (!session?.user?.id) return { totalMins: 0, sessions: [] };

  const [aggregate, sessions] = await Promise.all([
    db.meditationSession.aggregate({
      where: { userId: session.user.id },
      _sum: { duration: true },
    }),
    db.meditationSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalMins = aggregate._sum.duration || 0;
  return { totalMins, sessions };
}
