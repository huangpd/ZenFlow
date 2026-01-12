'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getTasks() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;
  
  // Get reset time from env (default to 00:00)
  const resetTime = process.env.DAILY_RESET_TIME || '00:00';
  const [resetHour, resetMinute] = resetTime.split(':').map(n => parseInt(n) || 0);
  
  const now = new Date();
  const resetThreshold = new Date(now);
  resetThreshold.setHours(resetHour, resetMinute, 0, 0);
  
  // If we haven't reached the reset time yet today, the threshold should be yesterday's reset time
  if (now < resetThreshold) {
    resetThreshold.setDate(resetThreshold.getDate() - 1);
  }

  // 1. Check if we need a reset (Check any task's updatedAt)
  const needsReset = await db.spiritualTask.findFirst({
    where: {
      userId,
      updatedAt: {
        lt: resetThreshold
      }
    }
  });

  if (needsReset) {
    console.log(`Reset threshold reached, resetting daily tasks and removing one-off tasks for user ${userId}`);
    
    await db.$transaction([
      // A. Delete tasks that are NOT marked as daily AND are old
      db.spiritualTask.deleteMany({
        where: { 
          userId, 
          isDaily: false,
          updatedAt: { lt: resetThreshold }
        }
      }),
      // B. Reset progress for tasks marked as daily AND are old
      db.spiritualTask.updateMany({
        where: { 
          userId, 
          isDaily: true, 
          updatedAt: { lt: resetThreshold }
        },
        data: {
          current: 0,
          completed: false
        }
      })
    ]);
  }

  return db.spiritualTask.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

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

  // Check for duplicates based on sutraId (preferred) or text
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
    // If exists, update its configuration (target/step/text/isDaily) and reactivate if completed
    const updated = await db.spiritualTask.update({
      where: { id: existingTask.id },
      data: { 
        completed: false, 
        text: data.text,
        target: data.target,
        step: data.step,
        sutraId: data.sutraId,
        // Preserve isDaily status if it exists, don't reset to false on re-selection
        isDaily: existingTask.isDaily,
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
        isDaily: false, // Default to false as per user request
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

export async function getAvailableSutras() {
  return db.sutra.findMany({
    select: { id: true, title: true, description: true, type: true, iconId: true, defaultStep: true }
  });
}

export async function getSutraContent(id: string) {
  return db.sutra.findUnique({
    where: { id },
    select: { title: true, content: true }
  });
}

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

  const updatedTask = await db.$transaction(async (tx) => {
    // Create log entry
    await tx.taskLog.create({
      data: {
        taskId: id,
        userId: userId,
        count: nextCurrent - task.current,
      },
    });

    // Update task
    return tx.spiritualTask.update({
      where: { id },
      data: {
        current: nextCurrent,
        completed: isFinished || task.completed,
      },
    });
  });

  revalidatePath('/dashboard');
  return { success: true, completed: isFinished && !task.completed };
}

export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await db.spiritualTask.delete({
    where: { id, userId: session.user.id }
  });

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateTask(id: string, data: { isDaily?: boolean; current?: number; target?: number }) {
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
  if (isProgressChanged) {
    const isFinished = task.target ? data.current! >= task.target : true;
    updates.completed = isFinished || task.completed;

    updated = await db.$transaction(async (tx) => {
      await tx.taskLog.create({
        data: {
          taskId: id,
          userId: userId,
          count: data.current! - task.current,
        },
      });

      return tx.spiritualTask.update({
        where: { id },
        data: updates,
      });
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