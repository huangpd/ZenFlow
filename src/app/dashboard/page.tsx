import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {session.user?.name || session.user?.email}</p>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/auth/login' });
        }}
      >
        <button type="submit" className="mt-4 p-2 text-white bg-red-600 rounded hover:bg-red-700">
          Sign Out
        </button>
      </form>
    </div>
  );
}