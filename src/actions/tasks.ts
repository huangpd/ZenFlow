'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getTasks() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;
  
  // Use local system time for reset threshold (e.g., Today's 00:00)
  const now = new Date();
  const resetThreshold = new Date(now);
  resetThreshold.setHours(0, 0, 0, 0); 

  // If you want to use a specific DAILY_RESET_TIME from env:
  const resetTime = process.env.DAILY_RESET_TIME || '00:00';
  const [resetHour, resetMinute] = resetTime.split(':').map(n => parseInt(n) || 0);
  resetThreshold.setHours(resetHour, resetMinute, 0, 0);

  // If current time is before the reset time, the actual threshold was yesterday
  if (now < resetThreshold) {
    resetThreshold.setDate(resetThreshold.getDate() - 1);
  }

  // A. Delete completed non-daily tasks older than threshold
  const deleted = await db.spiritualTask.deleteMany({
    where: { 
      userId, 
      isDaily: false,
      completed: true,
      updatedAt: { lt: resetThreshold }
    }
  });

  // B. Reset old daily tasks
  // NOTE: Explicitly setting updatedAt is required because Prisma's updateMany doesn't auto-update it.
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

  // If any changes were made, invalidate the dashboard path to show fresh data
  // Note: revalidatePath removed to avoid "during render" error. 
  // Since we fetch fresh data immediately below, the current render will be correct.
  // if (deleted.count > 0 || updated.count > 0) {
  //   revalidatePath('/dashboard');
  // }

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
        // Update isDaily if explicitly provided, otherwise preserve existing
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

  // Create log entry
  await db.taskLog.create({
    data: {
      taskId: id,
      userId: userId,
      count: nextCurrent - task.current,
    },
  });

  // Update task
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

export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await db.spiritualTask.delete({
    where: { id, userId: session.user.id }
  });

  revalidatePath('/dashboard');
  return { success: true };
}

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
    
    // Explicit completion overrides calculation if provided, otherwise use calculation or existing state
    if (data.completed !== undefined) {
      updates.completed = data.completed;
    } else if (isProgressChanged) {
      updates.completed = isFinished || task.completed;
    }

    if (isProgressChanged) {
      await db.taskLog.create({
        data: {
          taskId: id,
          userId: userId,
          count: data.current! - task.current,
        },
      });
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