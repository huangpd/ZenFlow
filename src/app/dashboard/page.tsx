import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import JournalSection from '@/components/JournalSection';
import { db } from '@/lib/db';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const userId = session.user.id;
  
  const [chatHistory, journalEntries] = await Promise.all([
    db.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    }),
    db.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
  ]);

  const formattedHistory = chatHistory.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar / Header Area */}
        <div className="lg:col-span-3 flex justify-between items-center mb-4">
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

        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-8">
          <ChatInterface initialMessages={formattedHistory} />
        </div>

        {/* Journal Sidebar */}
        <div className="lg:col-span-1">
          <JournalSection entries={journalEntries} />
        </div>
      </div>
    </div>
  );
}