import { auth } from '@/auth';
import DashboardContent from '@/components/DashboardContent';
import { db } from '@/lib/db';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  // 未登录时显示登陆页面
  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-stone-50 text-stone-800">
        <main className="flex flex-col gap-8 items-center text-center max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight text-stone-900">ZenFlow</h1>
          <p className="text-xl text-stone-600">
            您的个人 AI 灵性伴侣，助力正念与成长。
          </p>
          
          <div className="flex gap-4 mt-4">
            <Link 
              href="/auth/login" 
              className="px-6 py-3 text-lg font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 transition-colors"
            >
              登录
            </Link>
            <Link 
              href="/auth/register" 
              className="px-6 py-3 text-lg font-medium text-stone-800 border-2 border-stone-800 rounded-full hover:bg-stone-100 transition-colors"
            >
              注册
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-100">
              <h3 className="font-bold text-lg mb-2">灵性对话</h3>
              <p className="text-stone-500 text-sm">与 AI 进行深度交流，获取关于经典和人生的见解。</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-100">
              <h3 className="font-bold text-lg mb-2">正念练习</h3>
              <p className="text-stone-500 text-sm">通过每日任务和冥想计时器，培养内在的平静。</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-100">
              <h3 className="font-bold text-lg mb-2">成长记录</h3>
              <p className="text-stone-500 text-sm">记录您的灵性随笔，见证每一步心灵的蜕变。</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 已登录时显示 dashboard
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
    db.spiritualTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })
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