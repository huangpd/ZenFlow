import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardContent from '@/components/DashboardContent';
import { db } from '@/lib/db';
import { getTasks } from '@/actions/tasks';

/**
 * 用户仪表盘页面
 * 应用程序的核心界面，聚合了聊天记录、日记和每日任务等主要功能
 * 需要用户登录后才能访问
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const userId = session.user.id;
  
  const [chatHistory, journalEntries, tasks] = await Promise.all([
    db.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    }),
    db.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    getTasks()
  ]);

  const formattedHistory = chatHistory.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center">
      <div className="w-full max-w-4xl min-h-screen flex flex-col bg-white shadow-xl relative overflow-hidden md:border-x border-stone-200">
        
        <main className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          <DashboardContent 
            initialTasks={tasks}
            initialHistory={formattedHistory}
            initialJournal={journalEntries}
            userName={session.user?.name || session.user?.email || '修学者'}
          />
        </main>
      </div>
    </div>
  );
}