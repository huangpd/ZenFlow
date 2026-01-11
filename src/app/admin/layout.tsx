import { auth } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    redirect('/auth/login');
  }

  if (!isAdmin(session.user.email)) {
    redirect('/dashboard'); 
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">ZenFlow Admin</h1>
        <div className="text-sm opacity-80">{session.user.email}</div>
      </header>
      <main className="flex-1 bg-slate-50">
        {children}
      </main>
    </div>
  );
}
