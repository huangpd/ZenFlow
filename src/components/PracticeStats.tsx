'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, History, Sparkles, Brain, Timer as TimerIcon, CheckCircle2, ScrollText, HandHelping, ListTodo, Trophy } from 'lucide-react';
import { getPracticeStats, getDetailedTaskStats } from '@/actions/stats';
import { calculateProgressIndex } from '@/lib/progressIndex';
import { getDailyGuidance } from '@/actions/ai';
import { getTodayJournals } from '@/actions/journal';

export default function PracticeStats({ userName }: { userName: string }) {
  const [stats, setStats] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<{ today: any[], allTime: any[] }>({ today: [], allTime: [] });
  const [todayJournals, setTodayJournals] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const statsData = await getPracticeStats();
      const taskData = await getDetailedTaskStats();
      const journalData = await getTodayJournals();
      setStats(statsData);
      setTaskStats(taskData);
      setTodayJournals(journalData);
      const index = calculateProgressIndex(statsData, taskData);
      setProgressIndex(index);
    };
    loadStats();
  }, []);

  const getHeatmapColor = (value: number) => {
    switch (value) {
      case 0: return 'bg-stone-100';
      case 1: return 'bg-emerald-100';
      case 2: return 'bg-emerald-300';
      case 3: return 'bg-emerald-500';
      case 4: return 'bg-emerald-800';
      default: return 'bg-stone-100';
    }
  };

  const handleGuidance = async () => {
    setLoading(true);
    // 获取今日数据
    const today = stats[stats.length - 1]; // 最后一个是今天
    const todayMeditationMins = today ? today.meditationMins : 0;
    const todayTasksCount = taskStats.today.length;
    const todayTasksCompleted = taskStats.today.filter(t => t.completed).length;
    const journalCount = todayJournals.length;
    const journalCategories = [...new Set(todayJournals.map(j => j.category))];
    
    const result = await getDailyGuidance(
      todayMeditationMins,
      todayTasksCount,
      todayTasksCompleted,
      journalCount,
      journalCategories
    );
    setAiInsight(result);
    setLoading(false);
  };

  const totalMeds = stats.reduce((acc, s) => acc + s.meditationMins, 0);

  return (
    <div className="space-y-8 pb-12 h-full animate-in fade-in duration-500">
      <div className="flex flex-col items-start space-y-1 pt-4 px-2">
        <h2 className="text-2xl font-serif text-stone-800 tracking-wide">精进点滴</h2>
        <p className="text-sm text-stone-400 tracking-wide">
          {userName} · <span className="text-emerald-600">持续修持中</span>
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-7 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform"><Sparkles size={120} /></div>
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md"><Brain size={24} /></div>
            <button onClick={handleGuidance} className="text-[10px] bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md hover:bg-white/30 transition-all tracking-widest">刷新启示</button>
          </div>
          <h4 className="text-xl text-white">每日修行指引</h4>
          <p className="text-emerald-50/80 text-sm leading-relaxed italic font-serif font-light">
            {aiInsight || (loading ? "正在请教 AI 向导..." : "点击下方按钮开启今日智慧。")}
          </p>
          {!aiInsight && !loading && (
            <button onClick={handleGuidance} className="w-full py-3.5 bg-white text-emerald-700 rounded-2xl text-sm shadow-sm active:scale-95">开启修行寄语</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100 text-center">
          <div className="text-[10px] text-amber-600 tracking-[0.2em] mb-1 uppercase">坐禅总时长</div>
          <div className="text-4xl font-light text-stone-800 font-serif">{Math.floor(totalMeds / 60)}<span className="text-sm ml-1">h</span></div>
        </div>
        <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 text-center">
          <div className="text-[10px] text-emerald-600 tracking-[0.2em] mb-1 uppercase">精进指数</div>
          <div className="text-4xl font-light text-stone-800 font-serif">{progressIndex}<span className="text-sm ml-1">%</span></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Today's Stats */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-400 flex items-center tracking-widest px-1 uppercase">
              <ListTodo size={14} className="mr-2"/> 今日修持
            </h3>
            {taskStats.today.length > 0 ? (
              <div className="space-y-2 max-h-[260px] overflow-y-auto scrollbar-hide pr-1">
                {taskStats.today.map((t, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-xs font-bold text-stone-700">{t.text}</span>
                    <span className="text-xs font-mono text-emerald-600 font-bold bg-white px-2 py-1 rounded-md border border-stone-100">
                      {t.count} <span className="text-[9px] text-stone-400 font-normal">遍</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-stone-300 text-xs italic">今日暂无功课记录</div>
            )}
          </div>

          {/* All Time Stats */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-400 flex items-center tracking-widest px-1 uppercase">
              <Trophy size={14} className="mr-2"/> 累计圆满
            </h3>
            {taskStats.allTime.length > 0 ? (
              <div className="space-y-2 max-h-[260px] overflow-y-auto scrollbar-hide pr-1">
                {taskStats.allTime.map((t) => (
                  <div key={t.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-stone-100 shadow-sm">
                    <span className="text-xs font-bold text-stone-700">{t.text}</span>
                    <span className="text-xs font-mono text-amber-600 font-bold">
                      {t.count} <span className="text-[9px] text-stone-400 font-normal">次</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-stone-300 text-xs italic">暂无累计数据</div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-stone-400 flex items-center tracking-widest px-1 uppercase">
          <Calendar size={14} className="mr-2"/> 修行热力图
        </h3>
        <div className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {stats.map((d) => (
              <div 
                key={d.day} 
                onClick={() => setSelectedDay(d)} 
                className={`w-3.5 h-3.5 rounded-[3px] cursor-pointer transition-all hover:scale-110 ${getHeatmapColor(d.value)} ${selectedDay?.day === d.day ? 'ring-2 ring-stone-400 scale-125 z-10' : ''}`}
              ></div>
            ))}
          </div>
          <div className="mt-5 flex justify-between items-center text-[10px] text-stone-400 px-4 font-medium tracking-tighter uppercase">
            <span>懈怠</span>
            <div className="flex gap-1">{[0,1,2,3,4].map(v => <div key={v} className={`w-2 h-2 rounded-[1px] ${getHeatmapColor(v)}`}></div>)}</div>
            <span>非常精进</span>
          </div>
        </div>
        
        {selectedDay && (
          <div className="bg-white p-7 rounded-[2.5rem] border border-stone-100 shadow-md animate-in slide-in-from-top-4 duration-300 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-stone-50">
              <h4 className="font-bold text-stone-700 flex items-center tracking-tight"><Calendar size={18} className="mr-2 text-emerald-600"/>{selectedDay.fullDate}</h4>
              <span className={`px-4 py-1 rounded-full text-[10px] font-bold text-white shadow-sm ${selectedDay.value > 2 ? 'bg-emerald-600' : 'bg-stone-400'}`}>{selectedDay.value > 2 ? '法喜充满' : '初心勿忘'}</span>
            </div>

            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-stone-50 rounded-2xl flex flex-col items-center justify-center">
                     <TimerIcon size={16} className="text-stone-400 mb-1" />
                     <span className="text-xs font-bold text-stone-800">{selectedDay.meditationMins} 分钟</span>
                     <span className="text-[9px] text-stone-400 uppercase font-medium">坐禅修持</span>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl flex flex-col items-center justify-center">
                     <CheckCircle2 size={16} className="text-emerald-500 mb-1" />
                     <span className="text-xs font-bold text-stone-800">{selectedDay.dailyTasks.length} 次</span>
                     <span className="text-[9px] text-stone-400 uppercase font-medium">修持记录</span>
                  </div>
               </div>

               {selectedDay.dailyTasks.length > 0 && (
                 <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-stone-400 tracking-widest uppercase flex items-center">
                       <CheckCircle2 size={12} className="mr-2" /> 功课修持
                    </h5>
                    <div className="space-y-2">
                       {selectedDay.dailyTasks.map((log: any) => (
                         <div key={log.id} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <span className="text-xs font-bold text-stone-700">{log.task.text}</span>
                            <span className="text-[10px] font-mono text-stone-500 bg-white px-2 py-1 rounded-md border border-stone-100">
                              +{log.count}
                            </span>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {selectedDay.dailyLogs.length > 0 && (
                 <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-stone-400 tracking-widest uppercase flex items-center">
                       <ScrollText size={12} className="mr-2" /> 随喜回顾
                    </h5>
                    <div className="space-y-3">
                       {selectedDay.dailyLogs.map((log: any) => (
                         <div key={log.id} className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl">
                            <p className="text-sm text-stone-600 leading-relaxed italic">"{log.content}"</p>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {selectedDay.meditationMins === 0 && selectedDay.dailyTasks.length === 0 && selectedDay.dailyLogs.length === 0 && (
                 <div className="text-center py-10 space-y-2 opacity-30">
                    <HandHelping size={32} className="mx-auto text-stone-300" />
                    <p className="text-xs italic tracking-widest">此日无迹 · 亦是修行</p>
                 </div>
               )}
            </div>
          </div>
        )}
        {!selectedDay && (
          <div className="text-center py-6 text-stone-300 text-[10px] flex items-center justify-center font-medium tracking-widest">
             <History size={12} className="mr-2" /> 点击上方格子查看修持往事
          </div>
        )}
      </div>
    </div>
  );
}
