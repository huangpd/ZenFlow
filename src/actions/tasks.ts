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

  // Check for duplicates
  const existingTask = await db.spiritualTask.findFirst({
    where: {
      userId: session.user.id,
      text: data.text,
    },
  });

  if (existingTask) {
    // If exists, reactivate it if completed, or just return it
    if (existingTask.completed) {
      return db.spiritualTask.update({
        where: { id: existingTask.id },
        data: { completed: false, current: 0 }, // Reset or just reactivate? Let's reset current for a new "cycle" or keep it? 
        // User asked for "accumulate", so we should NOT reset current if they are "adding" it again, maybe just ensure it's visible.
        // Actually, if it's already there, we might just want to update target/step if provided.
        // Let's just return the existing task to prevent duplicates in the list.
      });
    }
    return existingTask;
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
