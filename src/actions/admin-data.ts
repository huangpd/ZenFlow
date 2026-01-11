'use server';

import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth-utils';
import { auth } from '@/auth';

export async function fetchModelData(modelName: string, page: number = 1, limit: number = 10) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    throw new Error("Unauthorized");
  }

  // Convert ModelName to camelCase (User -> user)
  const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelDelegate = (db as any)[prismaModelName];

  if (!modelDelegate) {
     throw new Error(`Invalid model: ${modelName}`);
  }

  const skip = (page - 1) * limit;

  // Try to determine sort field. Prefer updatedDt, then createdAt, then id
  // Since we don't have metadata here efficiently, we'll try a safe approach or just no sort.
  // Prisma doesn't crash on extra args? No, it crashes on invalid fields.
  // For now, no default sort to be safe across all tables.
  
  const [data, total] = await Promise.all([
    modelDelegate.findMany({
      skip,
      take: limit,
    }),
    modelDelegate.count(),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}