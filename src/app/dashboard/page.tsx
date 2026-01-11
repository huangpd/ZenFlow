import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import { db } from '@/lib/db';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const userId = session.user.id;
  const history = await db.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  const formattedHistory = history.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif text-stone-800">ZenFlow</h1>
            <p className="text-stone-500 text-sm">Welcome, {session.user?.name || session.user?.email}</p>
          </div>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/auth/login' });
            }}
          >
            <button type="submit" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
              Sign Out
            </button>
          </form>
        </div>

        <ChatInterface initialMessages={formattedHistory} />
      </div>
    </div>
  );
}