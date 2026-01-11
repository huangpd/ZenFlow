'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createJournalEntry(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const content = formData.get('content') as string;
  const mood = formData.get('mood') as string;

  if (!content) {
    return { error: 'Content is required' };
  }

  try {
    await db.journalEntry.create({
      data: {
        userId: session.user.id,
        content,
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

export async function deleteJournalEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await db.journalEntry.delete({
      where: {
        id,
        userId: session.user.id, // Ensure user owns the entry
      },
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Delete Journal Error:', error);
    return { error: 'Failed to delete entry' };
  }
}
