'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getTasks() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.spiritualTask.findMany({
    where: { userId: session.user.id },
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
    // If exists, update its configuration (target/step/text) and reactivate if completed
    return db.spiritualTask.update({
      where: { id: existingTask.id },
      data: { 
        completed: false, 
        text: data.text, // Update text in case Sutra title changed
        target: data.target,
        step: data.step,
        sutraId: data.sutraId,
        current: existingTask.completed ? 0 : existingTask.current
      },
    });
  }

  const task = await db.spiritualTask.create({
    data: {
      userId: session.user.id,
      ...data,
    },
  });

  revalidatePath('/dashboard');
  return task;
}

export async function getAvailableSutras() {
  return db.sutra.findMany({
    select: { id: true, title: true, description: true }
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
