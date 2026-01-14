'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * 创建日记条目
 * @param prevState 初始状态（用于 useActionState）
 * @param formData 表单数据
 */
export async function createJournalEntry(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const mood = formData.get('mood') as string;

  if (!content) {
    return { error: 'Content is required' };
  }

  try {
    await db.journalEntry.create({
      data: {
        userId: session.user.id,
        content,
        category: category || '感悟',
        mood: mood || 'neutral',
      },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Create Journal Error:', error);
    return { error: 'Failed to create entry' };
  }
}

/**
 * 删除指定日记条目
 * @param id 日记ID
 */
export async function deleteJournalEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await db.journalEntry.delete({
      where: {
        id,
        userId: session.user.id, // 确保用户拥有该条目
      },
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete Journal Error:', error);
    return { error: 'Failed to delete entry' };
  }
}

/**
 * 获取用户今日的所有日记
 */
export async function getTodayJournals() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entries = await db.journalEntry.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return entries;
  } catch (error) {
    console.error('Get Today Journals Error:', error);
    return [];
  }
}
