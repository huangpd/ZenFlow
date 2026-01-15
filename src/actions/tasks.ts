'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * 获取当前用户的所有功课任务
 * 包含自动重置逻辑：
 * 1. 删除已完成的非每日任务
 * 2. 重置每日任务的进度
 */
export async function getTasks() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  // 使用本地系统时间作为重置阈值（例如：今天的 00:00）
  const now = new Date();
  const resetThreshold = new Date(now);
  resetThreshold.setHours(0, 0, 0, 0);

  // 如果你想使用环境变量中指定的每日重置时间：
  const resetTime = process.env.DAILY_RESET_TIME || '00:00';
  const [resetHour, resetMinute] = resetTime.split(':').map(n => parseInt(n) || 0);
  resetThreshold.setHours(resetHour, resetMinute, 0, 0);

  // 如果当前时间早于重置时间，则实际阈值为昨天
  if (now < resetThreshold) {
    resetThreshold.setDate(resetThreshold.getDate() - 1);
  }

  // A. 删除早于阈值且已完成的非每日任务
  const deleted = await db.spiritualTask.deleteMany({
    where: {
      userId,
      isDaily: false,
      completed: true,
      updatedAt: { lt: resetThreshold }
    }
  });

  // B. 重置旧的每日任务
  // 注意：显式设置 updatedAt 是必需的，因为 Prisma 的 updateMany 不会自动更新它。
  const updated = await db.spiritualTask.updateMany({
    where: {
      userId,
      isDaily: true,
      updatedAt: { lt: resetThreshold }
    },
    data: {
      current: 0,
      completed: false,
      updatedAt: new Date()
    }
  });

  // 如果有任何更改，使仪表盘路径失效以显示新鲜数据
  // 注意：移除 revalidatePath 以避免“在渲染期间”出错。 
  // 既然我们立即在下方获取新鲜数据，当前渲染将是正确的。
  // if (deleted.count > 0 || updated.count > 0) {
  //   revalidatePath('/dashboard');
  // }

  return db.spiritualTask.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * 创建新功课任务
 * 如果已存在相同名称或佛经关联的任务，则更新并重新激活它
 */
export async function createTask(data: {
  text: string;
  type: string;
  iconId?: string;
  sutraId?: string;
  target?: number;
  step?: number;
  isDaily?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  // 根据佛经 ID（首选）或文本检查重复项
  const existingTask = await db.spiritualTask.findFirst({
    where: {
      userId: session.user.id,
      OR: [
        { sutraId: data.sutraId && data.sutraId !== "" ? data.sutraId : undefined },
        { text: data.text }
      ].filter(Boolean) as any,
    },
  });

  if (existingTask) {
    // 如果存在，更新其配置（目标/步长/文本/是否每日），如果已完成则重新激活
    const updated = await db.spiritualTask.update({
      where: { id: existingTask.id },
      data: {
        completed: false,
        text: data.text,
        target: data.target,
        step: data.step,
        sutraId: data.sutraId,
        // 使用提供的 isDaily 或保留现有的
        isDaily: data.isDaily !== undefined ? data.isDaily : existingTask.isDaily,
        current: existingTask.completed ? 0 : existingTask.current
      },
    });
    revalidatePath('/dashboard');
    return updated;
  }

  try {
    const task = await db.spiritualTask.create({
      data: {
        userId: session.user.id,
        isDaily: false, // 根据用户要求，默认为 false
        ...data,
      },
    });

    revalidatePath('/dashboard');
    return task;
  } catch (error) {
    console.error('Create Task Error:', error);
    throw error;
  }
}

/**
 * 获取可供选择的佛经列表
 * 包含用户当前的设置状态（如果已存在对应功课），如是否为每日功课、当前目标等
 */
export async function getAvailableSutras() {
  const session = await auth();
  const userId = session?.user?.id;

  const sutras = await db.sutra.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      iconId: true,
      defaultStep: true,
      defaultTarget: true
    }
  });

  if (!userId) {
    return sutras.map(s => ({
      ...s,
      isDaily: false,
      currentTarget: s.defaultTarget || 1,
      existingTaskId: null
    }));
  }

  // 获取用户所有任务以匹配状态
  const userTasks = await db.spiritualTask.findMany({
    where: { userId },
    select: { id: true, sutraId: true, isDaily: true, target: true, text: true }
  });

  return sutras.map(s => {
    // 优先通过 sutraId 匹配，其次尝试通过文本匹配（兼容旧数据）
    const taskText = s.type === 'sutra' ? `读诵《${s.title}》` : s.title;
    const existingTask = userTasks.find(t =>
      t.sutraId === s.id || t.text === taskText
    );

    return {
      ...s,
      isDaily: existingTask ? existingTask.isDaily : false,
      currentTarget: existingTask?.target || s.defaultTarget || 1,
      existingTaskId: existingTask?.id || null
    };
  });
}

/**
 * 获取指定佛经的正文内容
 */
export async function getSutraContent(id: string) {
  return db.sutra.findUnique({
    where: { id },
    select: { title: true, content: true }
  });
}

/**
 * 更新功课进度
 * 记录 TaskLog 并更新 SpiritualTask 的当前值 and 完成状态
 */
export async function updateTaskProgress(id: string, increment?: number, manualValue?: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId = session.user.id;

  const task = await db.spiritualTask.findUnique({ where: { id } });
  if (!task || task.userId !== userId) throw new Error('Forbidden');

  let nextCurrent = task.current;
  if (manualValue !== undefined) {
    nextCurrent = manualValue;
  } else {
    nextCurrent += (increment ?? 1);
  }

  const isFinished = task.target ? nextCurrent >= task.target : true;

  // 查找今日是否已有日志记录
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await db.taskLog.findFirst({
    where: {
      taskId: id,
      userId: userId,
      createdAt: {
        gte: today,
      },
    },
  });

  if (existingLog) {
    // 如果今日已有记录，直接更新该记录的 count
    await db.taskLog.update({
      where: { id: existingLog.id },
      data: {
        count: { increment: nextCurrent - task.current },
      },
    });
  } else {
    // 如果今日没有记录，创建新记录
    await db.taskLog.create({
      data: {
        taskId: id,
        userId: userId,
        count: nextCurrent - task.current,
      },
    });
  }

  // 更新任务
  const updatedTask = await db.spiritualTask.update({
    where: { id },
    data: {
      current: nextCurrent,
      completed: isFinished || task.completed,
    },
  });

  revalidatePath('/dashboard');
  return { success: true, completed: isFinished && !task.completed };
}

/**
 * 删除功课任务
 */
export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await db.spiritualTask.delete({
    where: { id, userId: session.user.id }
  });

  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * 更新功课任务配置或进度
 * 灵活支持更新是否每日、当前值、目标值等
 */
export async function updateTask(id: string, data: { isDaily?: boolean; current?: number; target?: number; completed?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId = session.user.id;

  const task = await db.spiritualTask.findUnique({ where: { id } });
  if (!task || task.userId !== userId) throw new Error('Forbidden');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {};
  if (data.isDaily !== undefined) updates.isDaily = data.isDaily;
  if (data.current !== undefined) updates.current = data.current;
  if (data.target !== undefined) updates.target = data.target;

  const isProgressChanged = data.current !== undefined && data.current !== task.current;

  let updated;
  if (isProgressChanged || data.completed !== undefined) {
    const isFinished = task.target && data.current !== undefined ? data.current >= task.target : true;

    // 如果提供了显式完成状态，则覆盖计算结果，否则使用计算结果或现有状态
    if (data.completed !== undefined) {
      updates.completed = data.completed;
    } else if (isProgressChanged) {
      updates.completed = isFinished || task.completed;
    }

    if (isProgressChanged) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingLog = await db.taskLog.findFirst({
        where: {
          taskId: id,
          userId: userId,
          createdAt: {
            gte: today,
          },
        },
      });

      const incrementValue = data.current! - task.current;

      if (existingLog) {
        await db.taskLog.update({
          where: { id: existingLog.id },
          data: {
            count: { increment: incrementValue },
          },
        });
      } else {
        await db.taskLog.create({
          data: {
            taskId: id,
            userId: userId,
            count: incrementValue,
          },
        });
      }
    }

    updated = await db.spiritualTask.update({
      where: { id },
      data: updates,
    });
  } else {
    updated = await db.spiritualTask.update({
      where: { id },
      data: updates,
    });
  }

  revalidatePath('/dashboard');
  return { success: true, task: updated };
}

/**
 * 检查是否存在对应佛经或文本的功课任务
 */
export async function checkExistingTask(sutraId?: string, text?: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.spiritualTask.findFirst({
    where: {
      userId: session.user.id,
      OR: [
        { sutraId: sutraId && sutraId !== "" ? sutraId : undefined },
        { text: text }
      ].filter(Boolean) as any,
    },
  });
}