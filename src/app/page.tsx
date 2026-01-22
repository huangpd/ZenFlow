import { auth } from '@/auth';
import DashboardContent from '@/components/DashboardContent';
import { db } from '@/lib/db';
import Link from 'next/link';
import { getTasks } from '@/actions/tasks';
import { Sparkles, BrainCircuit, Feather } from 'lucide-react';

/**
 * 应用首页
 * 根据用户登录状态展示不同内容：
 * 1. 未登录：展示产品介绍页 (Landing Page) 和登录/注册入口
 * 2. 已登录：加载用户数据并展示仪表盘 (Dashboard) 内容
 */
export default async function Home() {
  const session = await auth();

  // 未登录时显示登陆页面
  if (!session?.user?.id) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
        {/* 背景装饰光晕 */}
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply opacity-60" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-stone-200/50 rounded-full blur-[100px] pointer-events-none mix-blend-multiply opacity-60" />

        <main className="relative z-10 flex flex-col gap-10 items-center text-center max-w-4xl w-full">
          {/* Hero Section */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-2 rounded-full border border-stone-200 bg-white/50 backdrop-blur-sm shadow-sm">
              <span className="text-xs font-medium tracking-widest text-stone-500 uppercase">AI Spiritual Companion</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tight text-stone-800 drop-shadow-sm">
              ZenFlow
            </h1>
            <p className="text-lg md:text-xl text-stone-600 max-w-xl mx-auto leading-relaxed font-light">
              您的个人 AI 灵性伴侣<br className="hidden md:block"/>
              <span className="text-stone-400 text-base mt-2 block">在喧嚣中寻得一方静谧，助力正念与内在成长。</span>
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            <Link 
              href="/auth/login" 
              className="px-10 py-4 text-base font-medium text-white bg-stone-800 rounded-full hover:bg-stone-700 active:scale-95 transition-all shadow-lg shadow-stone-800/20 hover:shadow-xl"
            >
              开启旅程
            </Link>
            <Link 
              href="/auth/register" 
              className="px-10 py-4 text-base font-medium text-stone-700 bg-white/80 backdrop-blur-md border border-stone-200 rounded-full hover:bg-white hover:border-stone-300 active:scale-95 transition-all shadow-sm hover:shadow-md"
            >
              注册账号
            </Link>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="group p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/80 transition-all duration-500 hover:-translate-y-1">
              <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 text-stone-600">
                <Sparkles size={24} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl text-stone-800 mb-3">灵性对话</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                与 AI 进行深度且富有智慧的交流，获取关于经典义理与人生困惑的独特见解。
              </p>
            </div>

            <div className="group p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/80 transition-all duration-500 hover:-translate-y-1">
              <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 text-stone-600">
                <BrainCircuit size={24} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl text-stone-800 mb-3">正念系统</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                科学设计的每日任务体系与专业的冥想计时器，助您循序渐进地培养内在定力。
              </p>
            </div>

            <div className="group p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/80 transition-all duration-500 hover:-translate-y-1">
              <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 text-stone-600">
                <Feather size={24} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl text-stone-800 mb-3">灵性随笔</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                不仅是日记，更是您的修行档案。记录当下的感悟，见证每一刻心灵的微妙蜕变。
              </p>
            </div>
          </div>
          
          {/* Footer Copyright */}
          <div className="mt-12 text-stone-400 text-xs font-light tracking-wider animate-in fade-in duration-1000 delay-500">
            © 2026 ZENFLOW. ALL RIGHTS RESERVED.
          </div>
        </main>
      </div>
    );
  }

  // 已登录时显示 dashboard
  const userId = session.user.id;
  
  // 获取基础数据，拆分 Promise.all 以便在某些环境下提高稳定性
  const chatHistory = await db.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  const journalEntries = await db.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const tasks = await getTasks();

  const formattedHistory = chatHistory.map((msg: any) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col items-center">
      <div className="w-full max-w-4xl min-h-screen flex flex-col bg-white/40 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden md:border-x border-white/50">
        
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