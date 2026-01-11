'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getTasks() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;
  const todayStr = new Date().toLocaleDateString();

  // 1. Check if we need a reset (Check any task's updatedAt)
  const needsReset = await db.spiritualTask.findFirst({
    where: {
      userId,
      updatedAt: {
        lt: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  });

  if (needsReset) {
    console.log(`New day detected (${todayStr}), resetting daily tasks and removing one-off tasks for user ${userId}`);
    
    await db.$transaction([
      // A. Delete tasks that are NOT marked as daily
      db.spiritualTask.deleteMany({
        where: { userId, isDaily: false }
      }),
      // B. Reset progress for tasks marked as daily
      db.spiritualTask.updateMany({
        where: { userId, isDaily: true },
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
    return db.spiritualTask.update({
      where: { id: existingTask.id },
      data: { 
        completed: false, 
        text: data.text,
        target: data.target,
        step: data.step,
        sutraId: data.sutraId,
        isDaily: data.isDaily ?? true,
        current: existingTask.completed ? 0 : existingTask.current
      },
    });
  }

  try {
    const task = await db.spiritualTask.create({
      data: {
        userId: session.user.id,
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

export async function updateTask(id: string, data: { isDaily?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId = session.user.id;

  const task = await db.spiritualTask.findUnique({ where: { id } });
  if (!task || task.userId !== userId) throw new Error('Forbidden');

  await db.spiritualTask.update({
    where: { id },
    data: {
      isDaily: data.isDaily,
    },
  });

  revalidatePath('/dashboard');
  return { success: true };
}