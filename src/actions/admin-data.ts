'use server';

import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth-utils';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function fetchModelData(modelName: string, page: number = 1, limit: number = 10) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    console.log(`Access denied. User: ${session?.user?.email}, Admins: ${process.env.ADMIN_EMAILS}`);
    redirect('/');
  }

  const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelDelegate = (db as any)[prismaModelName];

  if (!modelDelegate) {
     throw new Error(`Invalid model: ${modelName}`);
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    modelDelegate.findMany({
      skip,
      take: limit,
    }),
    modelDelegate.count(),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function deleteRecord(modelName: string, id: string) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    console.log(`Access denied. User: ${session?.user?.email}, Admins: ${process.env.ADMIN_EMAILS}`);
    redirect('/');
  }

  const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelDelegate = (db as any)[prismaModelName];

  if (!modelDelegate) {
     throw new Error(`Invalid model: ${modelName}`);
  }

  await modelDelegate.delete({
    where: { id },
  });
  
  revalidatePath(`/admin/data/${modelName}`);
  revalidatePath('/dashboard');
}

export async function fetchRelatedList(modelName: string) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    console.log(`Access denied. User: ${session?.user?.email}, Admins: ${process.env.ADMIN_EMAILS}`);
    redirect('/');
  }

  const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelDelegate = (db as any)[prismaModelName];

  if (!modelDelegate) return [];

  const records = await modelDelegate.findMany({
    take: 100,
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return records.map((r: any) => ({
    id: r.id,
    label: r.name || r.title || r.email || r.text || r.id
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createRecord(modelName: string, data: any) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    console.log(`Access denied. User: ${session?.user?.email}, Admins: ${process.env.ADMIN_EMAILS}`);
    redirect('/');
  }

  const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelDelegate = (db as any)[prismaModelName];

  if (!modelDelegate) throw new Error(`Invalid model: ${modelName}`);

  await modelDelegate.create({ data });
  revalidatePath(`/admin/data/${modelName}`);
  revalidatePath('/dashboard');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateRecord(modelName: string, id: string, data: any) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    console.log(`Access denied. User: ${session?.user?.email}, Admins: ${process.env.ADMIN_EMAILS}`);
    redirect('/');
  }

  const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelDelegate = (db as any)[prismaModelName];

  if (!modelDelegate) throw new Error(`Invalid model: ${modelName}`);

  console.log(`Updating ${modelName} ${id}:`, data);

  await modelDelegate.update({
    where: { id },
    data,
  });
  revalidatePath(`/admin/data/${modelName}`);
  revalidatePath(`/admin/data/${modelName}/${id}`);
  revalidatePath('/dashboard');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchRecord(modelName: string, id: string) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    console.log(`Access denied. User: ${session?.user?.email}, Admins: ${process.env.ADMIN_EMAILS}`);
    redirect('/');
  }

  const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelDelegate = (db as any)[prismaModelName];

  if (!modelDelegate) throw new Error(`Invalid model: ${modelName}`);

  return await modelDelegate.findUnique({
    where: { id },
  });
}