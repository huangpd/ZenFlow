'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * 确保用户已登录且具有管理员权限的助手函数
 */
async function ensureAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  // 如果将来需要，在此处添加角色检查
}

/**
 * 获取所有公共佛经列表
 */
export async function getSutras() {
  await ensureAuth();
  return db.sutra.findMany({
    where: { isPublic: true },
    orderBy: { updatedAt: 'desc' },
  });
}

/**
 * 创建新佛经
 * @param data 佛经数据
 */
export async function createSutra(data: {
  title: string;
  description?: string;
  content?: string;
  type?: string;
  iconId?: string;
  defaultTarget?: number;
  defaultStep?: number;
}) {
  await ensureAuth();

  try {
    const formattedData = {
      ...data,
      defaultStep: data.defaultStep ? parseInt(data.defaultStep.toString()) : 1,
      defaultTarget: data.defaultTarget ? parseInt(data.defaultTarget.toString()) : 1,
      isPublic: true,  // 管理员创建的是公共佛经
      userId: null,    // 公共佛经不属于任何用户
    };

    await db.sutra.create({
      data: formattedData,
    });
    revalidatePath('/admin/sutras');
    revalidatePath('/dashboard'); // 同时更新用户选择列表
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: '功课标题已存在' };
    }
    console.error('Create Sutra Error:', error);
    return { error: `Failed to create sutra: ${error.message || 'Unknown error'}` };
  }
}

/**
 * 更新佛经信息
 * @param id 佛经ID
 * @param data 更新的数据
 */
export async function updateSutra(id: string, data: {
  title: string;
  description?: string;
  content?: string;
  type?: string;
  iconId?: string;
  defaultTarget?: number;
  defaultStep?: number;
}) {
  await ensureAuth();

  try {
    const formattedData = {
      ...data,
      defaultStep: data.defaultStep ? parseInt(data.defaultStep.toString()) : 1,
      defaultTarget: data.defaultTarget ? parseInt(data.defaultTarget.toString()) : 1,
    };

    await db.sutra.update({
      where: { id },
      data: formattedData,
    });
    revalidatePath('/admin/sutras');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: '功课标题已存在' };
    }
    console.error('Update Sutra Error:', error);
    return { error: `Failed to update sutra: ${error.message || 'Unknown error'}` };
  }
}

/**
 * 删除佛经
 * @param id 佛经ID
 */
export async function deleteSutra(id: string) {
  await ensureAuth();

  try {
    await db.sutra.delete({ where: { id } });
    revalidatePath('/admin/sutras');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (_) {
    return { error: 'Failed to delete sutra' };
  }
}
