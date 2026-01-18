'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * 确保用户已登录
 */
async function ensureAuth() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    return session.user.id;
}

/**
 * 获取当前用户的私有佛经列表
 */
export async function getUserSutras() {
    const userId = await ensureAuth();
    return db.sutra.findMany({
        where: {
            userId,
            isPublic: false
        },
        orderBy: { updatedAt: 'desc' },
    });
}

/**
 * 获取所有可用佛经(公共 + 用户私有)
 */
export async function getAllAvailableSutras() {
    const userId = await ensureAuth();
    return db.sutra.findMany({
        where: {
            OR: [
                { isPublic: true },           // 公共佛经
                { userId, isPublic: false }   // 用户私有佛经
            ]
        },
        orderBy: { updatedAt: 'desc' },
    });
}

/**
 * 创建用户私有佛经
 * @param data 佛经数据
 */
export async function createUserSutra(data: {
    title: string;
    description?: string;
    content?: string;
    type?: string;
    iconId?: string;
    defaultTarget?: number;
    defaultStep?: number;
}) {
    const userId = await ensureAuth();

    try {
        const formattedData = {
            ...data,
            defaultStep: data.defaultStep ? parseInt(data.defaultStep.toString()) : 1,
            defaultTarget: data.defaultTarget ? parseInt(data.defaultTarget.toString()) : 1,
            userId,           // 设置所有者
            isPublic: false,  // 用户创建的是私有佛经
        };

        await db.sutra.create({
            data: formattedData,
        });
        revalidatePath('/dashboard/my-sutras');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: '您已有同名功课,请使用不同的名称' };
        }
        console.error('Create User Sutra Error:', error);
        return { error: `创建失败: ${error.message || '未知错误'}` };
    }
}

/**
 * 更新用户私有佛经
 * @param id 佛经ID
 * @param data 更新的数据
 */
export async function updateUserSutra(id: string, data: {
    title: string;
    description?: string;
    content?: string;
    type?: string;
    iconId?: string;
    defaultTarget?: number;
    defaultStep?: number;
}) {
    const userId = await ensureAuth();

    try {
        // 验证所有权
        const sutra = await db.sutra.findUnique({ where: { id } });
        if (!sutra || sutra.userId !== userId) {
            return { error: '无权限编辑此功课' };
        }

        const formattedData = {
            ...data,
            defaultStep: data.defaultStep ? parseInt(data.defaultStep.toString()) : 1,
            defaultTarget: data.defaultTarget ? parseInt(data.defaultTarget.toString()) : 1,
        };

        await db.sutra.update({
            where: { id },
            data: formattedData,
        });
        revalidatePath('/dashboard/my-sutras');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: '您已有同名功课,请使用不同的名称' };
        }
        console.error('Update User Sutra Error:', error);
        return { error: `更新失败: ${error.message || '未知错误'}` };
    }
}

/**
 * 删除用户私有佛经
 * @param id 佛经ID
 */
export async function deleteUserSutra(id: string) {
    const userId = await ensureAuth();

    try {
        // 验证所有权
        const sutra = await db.sutra.findUnique({ where: { id } });
        if (!sutra || sutra.userId !== userId) {
            return { error: '无权限删除此功课' };
        }

        await db.sutra.delete({ where: { id } });
        revalidatePath('/dashboard/my-sutras');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (_) {
        return { error: '删除失败' };
    }
}
