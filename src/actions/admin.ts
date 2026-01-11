'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Helper to ensure admin (or just logged in for now)
async function ensureAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  // Add role check here if needed in future
}

export async function getSutras() {
  await ensureAuth();
  return db.sutra.findMany({
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createSutra(data: { title: string; description?: string; content: string }) {
  await ensureAuth();
  
  try {
    await db.sutra.create({
      data,
    });
    revalidatePath('/admin/sutras');
    revalidatePath('/dashboard'); // Update the user selection list too
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: '经文标题已存在' };
    }
    return { error: 'Failed to create sutra' };
  }
}

export async function updateSutra(id: string, data: { title: string; description?: string; content: string }) {
  await ensureAuth();

  try {
    await db.sutra.update({
      where: { id },
      data,
    });
    revalidatePath('/admin/sutras');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: '经文标题已存在' };
    }
    return { error: 'Failed to update sutra' };
  }
}

export async function deleteSutra(id: string) {
  await ensureAuth();

  try {
    await db.sutra.delete({ where: { id } });
    revalidatePath('/admin/sutras');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete sutra' };
  }
}
