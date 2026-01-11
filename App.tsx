
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Timer as TimerIcon, ClipboardList, PenLine, BarChart3, 
  Play, Pause, RotateCcw, CheckCircle2, 
  Circle, BookOpen, ChevronLeft, Plus, Check,
  Hash, Edit3, Flame, BellRing, Sparkles, Brain, Image as ImageIcon, 
  Loader2, Calendar, History, Settings2, ArrowLeft, ScrollText, Wind, Search, X,
  HandHelping
} from 'lucide-react';
import { Task, DiaryEntry, DayStats, TaskType } from './types';
import { SUTRA_DATABASE, CATEGORIES, PRESET_LIBRARY, ICON_MAP } from './constants';
import { GeminiService } from './services/geminiService';
import { LocalDBService } from './services/localDB';
import { CelebrationEffect } from './components/CelebrationEffect';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'homework' | 'log' | 'timer' | 'stats'>('homework');
  const [readingTask, setReadingTask] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  const [configuringTask, setConfiguringTask] = useState<any | null>(null);
  const [configTarget, setConfigTarget] = useState(1);
  const [configStep, setConfigStep] = useState(1);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState("");

  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [meditationHistory, setMeditationHistory] = useState<number>(0);
  const [meditationData, setMeditationData] = useState<{date: string, minutes: number}[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<DiaryEntry[]>([]);
  
  const [newLog, setNewLog] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('感悟');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [selectedDayInfo, setSelectedDayInfo] = useState<DayStats | null>(null);

  // Initialize DB and load data
  useEffect(() => {
    const initData = async () => {
      await LocalDBService.init();
      const savedTasks = await LocalDBService.getAllTasks();
      const savedLogs = await LocalDBService.getAllLogs();
      const savedMeds = await LocalDBService.getAllMeditation();
      
      if (savedTasks.length === 0) {
        // Initial defaults
        const defaultTasks: Task[] = [
          { id: '1', text: '清晨上香', type: 'normal', iconId: 'flame', completed: true, dateCreated: new Date().toLocaleDateString() },
          { id: '2', text: '大悲咒', type: 'counter', iconId: 'hash', current: 0, target: 21, step: 7, completed: false, dateCreated: new Date().toLocaleDateString() },
        ];
        for (const t of defaultTasks) await LocalDBService.saveTask(t);
        setTasks(defaultTasks);
      } else {
        setTasks(savedTasks);
      }
      
      setLogs(savedLogs);
      setMeditationData(savedMeds);
      setMeditationHistory(savedMeds.reduce((acc, curr) => acc + curr.minutes, 0));
    };
    initData();
  }, []);

  const playBell = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2);
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      handleMeditationComplete();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, playBell, selectedDuration]);

  const handleMeditationComplete = async () => {
    playBell();
    triggerCompletion();
    const today = new Date().toLocaleDateString();
    await LocalDBService.saveMeditation(today, selectedDuration);
    const updatedMeds = await LocalDBService.getAllMeditation();
    setMeditationData(updatedMeds);
    setMeditationHistory(updatedMeds.reduce((acc, curr) => acc + curr.minutes, 0));
  };

  const triggerCompletion = () => {
    setShowEffect(true);
    setTimeout(() => setShowEffect(false), 3000);
  };

  const handleDurationChange = (mins: number) => {
    if (timerRunning) return;
    setSelectedDuration(mins);
    setTimeLeft(mins * 60);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            log.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory ? log.category === filterCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [logs, searchQuery, filterCategory]);

  const heatmapData = useMemo(() => {
    const data: DayStats[] = [];
    const todayDate = new Date();
    for (let i = 0; i < 84; i++) {
      const date = new Date(todayDate);
      date.setDate(date.getDate() - (83 - i));
      const dateStr = date.toLocaleDateString();
      
      const dayMeds = meditationData.find(m => m.date === dateStr)?.minutes || 0;
      const dayLogs = logs.filter(l => l.date === dateStr);
      const dayTasks = tasks.filter(t => t.completed && t.dateCreated === dateStr);

      // Score 0-4 based on activity
      let value = 0;
      if (dayMeds > 0) value += 1;
      if (dayLogs.length > 0) value += 1;
      if (dayTasks.length > 0) value += 1;
      if (dayMeds > 45 || dayTasks.length > 3) value += 1;

      data.push({
        day: i,
        dateStr,
        fullDate: date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
        value,
        meditationMins: dayMeds,
        dailyTasks: dayTasks,
        dailyLogs: dayLogs
      });
    }
    return data;
  }, [logs, tasks, meditationData]);

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

  const updateTaskInDB = async (updatedTask: Task) => {
    await LocalDBService.saveTask(updatedTask);
    const all = await LocalDBService.getAllTasks();
    setTasks(all);
  };

  const handleTaskStep = async (id: string | number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const next = (task.current || 0) + (task.step || 1);
      const isFinished = task.target ? next >= task.target : false;
      if (isFinished && !task.completed) triggerCompletion();
      await updateTaskInDB({ ...task, current: next, completed: isFinished || task.completed });
    }
  };

  const handleManualEdit = async (id: string | number) => {
    const val = prompt("请输入今日累计圆满遍数:");
    if (val !== null && !isNaN(parseInt(val))) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        const next = parseInt(val);
        const isFinished = task.target ? next >= task.target : false;
        if (isFinished && !task.completed) triggerCompletion();
        await updateTaskInDB({ ...task, current: next, completed: isFinished || task.completed });
      }
    }
  };

  const submitTask = async (id: string | number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const next = (task.current || 0) + 1;
      const isFinished = task.target ? next >= task.target : true;
      if (isFinished) triggerCompletion();
      await updateTaskInDB({ ...task, current: next, completed: isFinished });
    }
  };

  const saveLog = async () => {
    if (!newLog.trim()) return;
    const entry: DiaryEntry = {
      id: Date.now(),
      category: selectedCategory,
      content: newLog,
      date: new Date().toLocaleDateString(),
    };
    await LocalDBService.saveLog(entry);
    setLogs(await LocalDBService.getAllLogs());
    setNewLog('');
    setGeneratedImg(null);
  };

  const handleGenerateImg = async () => {
    if (!newLog.trim()) return;
    setAiLoading(true);
    const url = await GeminiService.generateZenImage(newLog);
    setGeneratedImg(url);
    setAiLoading(false);
  };

  const handleAiInsight = async () => {
    if (!readingTask) return;
    setAiLoading(true);
    const result = await GeminiService.getSutraInsight(readingTask.content);
    setAiResponse(result);
    setAiLoading(false);
  };

  const handleDailyGuidance = async () => {
    setAiLoading(true);
    const result = await GeminiService.getDailyGuidance(25, tasks.filter(t => t.completed).length);
    setAiInsight(result);
    setAiLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-stone-100 text-stone-800 p-0 sm:p-4">
      <div className="w-full max-w-md h-[100dvh] sm:h-[840px] sm:max-h-[90vh] bg-[#FDFCFB] shadow-2xl relative sm:rounded-[3rem] overflow-hidden flex flex-col border-0 sm:border-[6px] border-stone-800">
        
        {showEffect && <CelebrationEffect />}

        <header className="h-14 flex-shrink-0 flex items-center justify-center pt-2">
           <div className="w-32 h-6 bg-stone-800 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-stone-600 rounded-full mr-1.5"></div>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 scrollbar-hide">
          {readingTask ? (
            <div className="animate-in fade-in slide-in-from-right duration-300 h-full flex flex-col py-4">
              <button onClick={() => { setReadingTask(null); setAiResponse(""); }} className="mb-4 flex items-center text-stone-500 text-sm font-medium">
                <ChevronLeft size={18} className="mr-1" /> 返回功课
              </button>
              <h2 className="text-2xl font-serif-zh font-bold text-stone-800 text-center mb-6">《{readingTask.title}》</h2>
              <div className="flex-1 overflow-y-auto p-6 bg-white rounded-3xl border border-stone-100 shadow-sm font-serif-zh text-lg leading-relaxed text-stone-700 whitespace-pre-wrap mb-6">
                {readingTask.content}
              </div>
              
              <div className="space-y-4 pb-12">
                <button onClick={handleAiInsight} disabled={aiLoading} className="w-full py-4 bg-emerald-800/5 border border-emerald-800/10 text-emerald-800 rounded-2xl flex items-center justify-center space-x-2 font-medium">
                  {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
                  <span>AI 禅意开解</span>
                </button>

                {aiResponse && (
                  <div className="p-5 bg-white border border-emerald-100 rounded-2xl animate-in zoom-in-95">
                    <h4 className="text-xs font-bold text-emerald-600 mb-2 flex items-center">
                      <Sparkles size={12} className="mr-1"/> 智慧启迪
                    </h4>
                    <p className="text-sm text-stone-600 italic leading-relaxed">{aiResponse}</p>
                  </div>
                )}

                <button onClick={() => { submitTask(readingTask.id); setReadingTask(null); }} className="w-full py-4 bg-stone-800 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-transform">
                  <Check size={20} />
                  <span>读诵圆满</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2 h-full flex flex-col">
              {activeTab === 'homework' && (
                <div className="space-y-6 pb-12 h-full">
                   <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-bold tracking-tight text-stone-800">每日功课</h2>
                      <button onClick={() => { setConfiguringTask(null); setShowAddModal(true); }} className="p-2 bg-stone-100 rounded-full active:bg-stone-200 transition-colors">
                        <Plus size={24} />
                      </button>
                   </div>
                   <div className="space-y-4">
                      {tasks.map(task => (
                        <div key={task.id} className={`group bg-white p-5 rounded-3xl border transition-all ${task.completed ? 'border-emerald-100 opacity-60 shadow-none' : 'border-stone-100 shadow-sm hover:shadow-md'}`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-600">
                                {ICON_MAP[task.iconId || ''] || <Circle size={18}/>}
                              </div>
                              <span className={`text-lg font-bold ${task.completed ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{task.text}</span>
                            </div>
                            {task.completed && <CheckCircle2 className="text-emerald-600" size={24}/>}
                          </div>
                          {!task.completed && (
                            <div className="pl-16">
                              {(task.type === 'counter' || (task.type === 'sutra' && task.target && task.target > 0)) && (
                                <div className="mb-4 space-y-3">
                                  <div className="flex items-baseline justify-between">
                                    <div className="flex items-baseline space-x-1">
                                      <span className="text-3xl font-mono font-bold text-stone-800">{task.current || 0}</span>
                                      {task.target && <span className="text-sm text-stone-400">/ {task.target}</span>}
                                    </div>
                                    <button onClick={() => handleManualEdit(task.id)} className="text-[10px] text-stone-400 flex items-center hover:text-emerald-600 transition-colors">
                                      <Edit3 size={10} className="mr-1"/> 修改
                                    </button>
                                  </div>
                                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-700 ${task.type === 'sutra' ? 'bg-emerald-600' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, ((task.current || 0) / (task.target || 1)) * 100)}%` }}></div>
                                  </div>
                                </div>
                              )}
                              {task.type === 'counter' ? (
                                <div className="flex space-x-3 pt-1">
                                  <button onClick={() => handleTaskStep(task.id)} className="flex-1 h-12 bg-stone-100 rounded-2xl text-stone-600 font-bold active:scale-95 transition-all">+{task.step}</button>
                                  <button onClick={() => submitTask(task.id)} className="flex-1 h-12 bg-emerald-800 text-white rounded-2xl text-sm font-bold shadow-md active:scale-95 flex items-center justify-center">
                                    <BellRing size={16} className="mr-2"/> 提交
                                  </button>
                                </div>
                              ) : task.type === 'sutra' ? (
                                <button onClick={() => setReadingTask({ ...task, ...SUTRA_DATABASE[task.sutraId || ''] })} className="w-full py-3.5 bg-stone-800 text-white rounded-2xl text-sm font-bold flex items-center justify-center shadow-lg active:scale-95">
                                  <BookOpen size={18} className="mr-2"/> 开始阅经
                                </button>
                              ) : (
                                <button onClick={() => submitTask(task.id)} className="w-full py-3 bg-stone-50 border border-stone-100 rounded-2xl text-stone-600 text-sm font-medium hover:bg-stone-100 transition-colors">
                                  标记完成
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === 'log' && (
                <div className="space-y-6 pb-12 h-full flex flex-col">
                   <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-bold text-stone-800">随喜日记</h2>
                      <button 
                        onClick={() => { setIsSearchMode(!isSearchMode); if(isSearchMode) { setSearchQuery(''); setFilterCategory(null); } }} 
                        className={`p-2 rounded-full transition-all ${isSearchMode ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'}`}
                      >
                        {isSearchMode ? <X size={20} /> : <Search size={20} />}
                      </button>
                   </div>

                   {isSearchMode && (
                     <div className="animate-in slide-in-from-top-4 duration-300 space-y-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-3.5 text-stone-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="搜索感悟、分类或关键词..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-stone-100 pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-stone-200 transition-all shadow-sm"
                          />
                        </div>
                        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
                          <button 
                            onClick={() => setFilterCategory(null)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${filterCategory === null ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-400 border-stone-100'}`}
                          >
                            全部
                          </button>
                          {CATEGORIES.map(cat => (
                            <button 
                              key={cat.label} 
                              onClick={() => setFilterCategory(cat.label)}
                              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all border ${filterCategory === cat.label ? 'bg-stone-800 text-white border-stone-800 shadow-md scale-105' : 'bg-white text-stone-400 border-stone-100'}`}
                            >
                              {cat.icon}<span>{cat.label}</span>
                            </button>
                          ))}
                        </div>
                     </div>
                   )}

                   {!isSearchMode ? (
                     <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                          {CATEGORIES.map(cat => (
                            <button key={cat.label} onClick={() => setSelectedCategory(cat.label)} className={`flex items-center space-x-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all border ${selectedCategory === cat.label ? 'bg-stone-800 text-white border-stone-800 shadow-md scale-105' : 'bg-white text-stone-500 border-stone-100'}`}>
                              {cat.icon}<span>{cat.label}</span>
                            </button>
                          ))}
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-stone-100 shadow-sm">
                          <textarea className="w-full h-32 bg-transparent resize-none outline-none text-stone-700 placeholder:text-stone-300 mb-4" placeholder={`记录此刻的${selectedCategory}...`} value={newLog} onChange={e => setNewLog(e.target.value)} />
                          <div className="flex space-x-3">
                            <button onClick={saveLog} className="flex-1 h-12 bg-stone-800 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all">存入功德</button>
                            <button onClick={handleGenerateImg} disabled={!newLog.trim() || aiLoading} className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-amber-200">
                              {aiLoading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                            </button>
                          </div>
                        </div>
                        {generatedImg && (
                          <div className="bg-white p-3 rounded-[2rem] border border-stone-100 shadow-md animate-in zoom-in-95">
                            <img src={generatedImg} alt="Zen Insight" className="w-full aspect-square object-cover rounded-[1.5rem]" />
                            <p className="text-[10px] text-center text-stone-400 py-3 italic tracking-widest">✨ AI 修行意象</p>
                          </div>
                        )}
                        <div className="space-y-4 pb-12">
                          <h3 className="text-xs font-bold text-stone-300 tracking-[0.2em] px-1 uppercase">近期随喜</h3>
                          {logs.slice(0, 3).map(log => (
                            <div key={log.id} className="bg-white/50 p-6 rounded-3xl border border-stone-100 shadow-sm group">
                               <div className="flex items-center justify-between mb-3">
                                  <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${CATEGORIES.find(c => c.label === log.category)?.color}`}>{log.category}</span>
                                  <span className="text-[10px] text-stone-300 font-mono tracking-wider">{log.date}</span>
                               </div>
                               <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">{log.content}</p>
                            </div>
                          ))}
                          <button onClick={() => setIsSearchMode(true)} className="w-full py-4 text-xs text-stone-400 font-bold border-2 border-dashed border-stone-100 rounded-3xl hover:border-stone-200 transition-all uppercase tracking-widest">
                            查看全部往期复盘
                          </button>
                        </div>
                     </div>
                   ) : (
                     <div className="flex-1 overflow-y-auto space-y-4 pb-20 scrollbar-hide animate-in fade-in duration-500">
                        {filteredLogs.length > 0 ? (
                          filteredLogs.map(log => (
                            <div key={log.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all group">
                               <div className="flex items-center justify-between mb-3">
                                  <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${CATEGORIES.find(c => c.label === log.category)?.color}`}>{log.category}</span>
                                  <span className="text-[10px] text-stone-300 font-mono tracking-wider">{log.date}</span>
                               </div>
                               <p className="text-sm text-stone-700 leading-relaxed">{log.content}</p>
                            </div>
                          ))
                        ) : (
                          <div className="h-60 flex flex-col items-center justify-center space-y-4 text-stone-300 italic animate-in zoom-in-95">
                             <ScrollText size={48} strokeWidth={1} />
                             <p className="text-xs tracking-widest">空空如也 · 静待花开</p>
                          </div>
                        )}
                     </div>
                   )}
                </div>
              )}

              {activeTab === 'timer' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-2 animate-in fade-in duration-700 overflow-hidden">
                   <div className="text-center space-y-0.5">
                      <h2 className="text-xl font-serif-zh font-bold text-stone-800 tracking-wide">静坐冥想</h2>
                      <p className="text-[10px] text-stone-400 font-medium italic">心安神定 · 观照内外</p>
                   </div>

                   <div className="relative flex items-center justify-center">
                      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
                        <circle cx="72" cy="72" r="68" className="stroke-stone-100 fill-none stroke-[2px]" />
                        <circle 
                          cx="72" 
                          cy="72" 
                          r="68" 
                          className="stroke-emerald-800 fill-none stroke-[2px] transition-all duration-1000" 
                          strokeDasharray={427.2}
                          strokeDashoffset={427.2 * (1 - timeLeft / (selectedDuration * 60))}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <div className="text-3xl font-light font-mono text-stone-800 tracking-tighter">
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </div>
                        {timerRunning && (
                           <div className="flex items-center mt-1 space-x-1 text-emerald-600 animate-pulse opacity-60">
                              <Wind size={8} />
                              <span className="text-[7px] font-bold uppercase tracking-widest">静心</span>
                           </div>
                        )}
                      </div>
                   </div>

                   <div className="flex flex-col items-center space-y-4 w-full max-w-[200px]">
                      <div className="flex justify-between w-full">
                         {[10, 25, 45, 60].map(mins => (
                            <button key={mins} disabled={timerRunning} onClick={() => handleDurationChange(mins)} className={`px-2 py-1 rounded-lg text-[8px] font-bold transition-all ${selectedDuration === mins ? 'bg-stone-800 text-white shadow-sm' : 'bg-stone-50 text-stone-300'}`}>
                              {mins}m
                            </button>
                         ))}
                      </div>

                      <div className="flex items-center space-x-6">
                        <button onClick={() => { setTimeLeft(selectedDuration * 60); setTimerRunning(false); }} className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 active:scale-90 transition-all">
                          <RotateCcw size={16} />
                        </button>
                        <button onClick={() => setTimerRunning(!timerRunning)} className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-90 ${timerRunning ? 'bg-amber-600' : 'bg-stone-800'}`}>
                          {timerRunning ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
                        </button>
                        <button className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 active:scale-90 transition-all">
                          <Settings2 size={16} />
                        </button>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-8 pb-12 h-full">
                   <h2 className="text-3xl font-bold text-stone-800">精进点滴</h2>
                   <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-7 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform"><Sparkles size={120} /></div>
                      <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md"><Brain size={24} /></div>
                          <button onClick={handleDailyGuidance} className="text-[10px] bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md hover:bg-white/30 transition-all font-bold tracking-widest">刷新启示</button>
                        </div>
                        <h4 className="text-xl font-bold">每日修行指引</h4>
                        <p className="text-emerald-50/80 text-sm leading-relaxed italic font-serif-zh font-light">{aiInsight || (aiLoading ? "正在请教 AI 向导..." : "点击下方按钮开启今日智慧。")}</p>
                        {!aiInsight && !aiLoading && <button onClick={handleDailyGuidance} className="w-full py-3.5 bg-white text-emerald-900 rounded-2xl font-bold text-sm shadow-xl active:scale-95">开启修行寄语</button>}
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100 text-center">
                        <div className="text-[10px] text-amber-800 font-bold tracking-[0.2em] mb-1">坐禅总时长</div>
                        <div className="text-4xl font-light text-stone-800 font-serif-zh">{Math.floor(meditationHistory / 60)}<span className="text-sm ml-1">h</span></div>
                      </div>
                      <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 text-center">
                        <div className="text-[10px] text-emerald-800 font-bold tracking-[0.2em] mb-1">精进指数</div>
                        <div className="text-4xl font-light text-stone-800 font-serif-zh">88<span className="text-sm ml-1">%</span></div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-sm font-bold text-stone-400 flex items-center tracking-widest px-1"><Calendar size={14} className="mr-2"/> 修行热力图</h3>
                      <div className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm">
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {heatmapData.map((d) => (
                            <div key={d.day} onClick={() => setSelectedDayInfo(d)} className={`w-3.5 h-3.5 rounded-[3px] cursor-pointer transition-all hover:scale-110 ${getHeatmapColor(d.value)} ${selectedDayInfo?.day === d.day ? 'ring-2 ring-stone-400 scale-125 z-10' : ''}`}></div>
                          ))}
                        </div>
                        <div className="mt-5 flex justify-between items-center text-[10px] text-stone-400 px-4 font-medium tracking-tighter uppercase">
                          <span>懈怠</span>
                          <div className="flex gap-1">{[0,1,2,3,4].map(v => <div key={v} className={`w-2 h-2 rounded-[1px] ${getHeatmapColor(v)}`}></div>)}</div>
                          <span>非常精进</span>
                        </div>
                      </div>
                      
                      {selectedDayInfo && (
                        <div className="bg-white p-7 rounded-[2.5rem] border border-stone-100 shadow-md animate-in slide-in-from-top-4 duration-300 space-y-6">
                          <div className="flex justify-between items-center pb-2 border-b border-stone-50">
                            <h4 className="font-bold text-stone-700 flex items-center tracking-tight"><Calendar size={18} className="mr-2 text-emerald-600"/>{selectedDayInfo.fullDate}</h4>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-bold text-white shadow-sm ${selectedDayInfo.value > 2 ? 'bg-emerald-600' : 'bg-stone-400'}`}>{selectedDayInfo.value > 2 ? '法喜充满' : '初心勿忘'}</span>
                          </div>

                          <div className="space-y-4">
                             {/* Stats Grid */}
                             <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-stone-50 rounded-2xl flex flex-col items-center justify-center">
                                   <TimerIcon size={16} className="text-stone-400 mb-1" />
                                   <span className="text-xs font-bold text-stone-800">{selectedDayInfo.meditationMins} 分钟</span>
                                   <span className="text-[9px] text-stone-400 uppercase font-medium">坐禅修持</span>
                                </div>
                                <div className="p-4 bg-stone-50 rounded-2xl flex flex-col items-center justify-center">
                                   <CheckCircle2 size={16} className="text-emerald-500 mb-1" />
                                   <span className="text-xs font-bold text-stone-800">{selectedDayInfo.dailyTasks.length} 项</span>
                                   <span className="text-[9px] text-stone-400 uppercase font-medium">圆满功课</span>
                                </div>
                             </div>

                             {/* Diary Reflection Section */}
                             {selectedDayInfo.dailyLogs.length > 0 && (
                               <div className="space-y-3">
                                  <h5 className="text-[10px] font-bold text-stone-400 tracking-widest uppercase flex items-center">
                                     <ScrollText size={12} className="mr-2" /> 随喜回顾
                                  </h5>
                                  <div className="space-y-3">
                                     {selectedDayInfo.dailyLogs.map(log => (
                                       <div key={log.id} className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl">
                                          <div className="flex justify-between items-center mb-2">
                                             <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${CATEGORIES.find(c => c.label === log.category)?.color}`}>{log.category}</span>
                                          </div>
                                          <p className="text-sm text-stone-600 leading-relaxed italic">"{log.content}"</p>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                             )}

                             {selectedDayInfo.meditationMins === 0 && selectedDayInfo.dailyTasks.length === 0 && selectedDayInfo.dailyLogs.length === 0 && (
                               <div className="text-center py-10 space-y-2 opacity-30">
                                  <HandHelping size={32} className="mx-auto text-stone-300" />
                                  <p className="text-xs italic tracking-widest">此日无迹 · 亦是修行</p>
                               </div>
                             )}
                          </div>
                        </div>
                      )}
                      {!selectedDayInfo && (
                        <div className="text-center py-6 text-stone-300 text-[10px] flex items-center justify-center font-medium tracking-widest">
                           <History size={12} className="mr-2" /> 点击上方格子查看修持往事
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>
          )}
        </main>

        <nav className="h-24 bg-white/80 backdrop-blur-xl border-t border-stone-100 flex items-center justify-around px-4 pb-4 flex-shrink-0 z-50">
          <NavItem active={activeTab === 'homework'} onClick={() => setActiveTab('homework')} icon={<ClipboardList size={24} />} label="功课" />
          <NavItem active={activeTab === 'log'} onClick={() => setActiveTab('log')} icon={<PenLine size={24} />} label="随喜" />
          <NavItem active={activeTab === 'timer'} onClick={() => setActiveTab('timer')} icon={<TimerIcon size={24} />} label="静坐" />
          <NavItem active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={24} />} label="精进" />
        </nav>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[120] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[95dvh] overflow-y-auto">
            {!configuringTask ? (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-stone-800">请领功课</h3>
                  <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400"><Plus size={24} className="rotate-45" /></button>
                </div>
                <div className="space-y-3 pb-8">
                  {PRESET_LIBRARY.map(item => (
                    <button key={item.id} onClick={() => { setConfiguringTask(item); setConfigTarget(1); setConfigStep(item.id === 'lyz' ? 1 : 108); }} className="w-full flex items-center p-5 bg-stone-50 rounded-[1.5rem] border border-transparent hover:border-emerald-200 transition-all hover:bg-emerald-50 group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform">{ICON_MAP[item.iconId || '']}</div>
                      <div className="text-left flex-1"><span className="font-bold text-stone-800 block">{item.text}</span><span className="text-[10px] text-stone-400 uppercase tracking-widest">{item.type}</span></div>
                      <Plus size={18} className="text-stone-300" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="animate-in slide-in-from-right duration-300">
                <div className="flex items-center mb-8">
                  <button onClick={() => setConfiguringTask(null)} className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center mr-3"><ArrowLeft size={20} /></button>
                  <h3 className="text-2xl font-bold text-stone-800">修持设定</h3>
                </div>
                <div className="space-y-8 mb-10">
                   <div className="text-center py-6 bg-stone-50 rounded-[2rem] border border-stone-100 mb-4">
                      <div className="scale-150 flex justify-center mb-2">{ICON_MAP[configuringTask.iconId || '']}</div>
                      <p className="font-serif-zh font-bold text-lg text-stone-800">{configuringTask.text}</p>
                   </div>
                   <div className="space-y-4">
                      <label className="text-xs font-bold text-stone-400 tracking-[0.2em] flex items-center"><Settings2 size={12} className="mr-2"/> 每日发愿目标 (遍/日)</label>
                      <input type="number" value={configTarget} onChange={(e) => setConfigTarget(Math.max(1, parseInt(e.target.value) || 0))} className="w-full bg-stone-50 border border-stone-200 p-6 rounded-3xl text-center text-4xl font-mono font-bold text-emerald-800 focus:ring-4 focus:ring-emerald-100 transition-all outline-none" />
                   </div>
                   {configuringTask.type === 'counter' && (
                     <div className="space-y-4">
                        <label className="text-xs font-bold text-stone-400 tracking-[0.2em] flex items-center"><Hash size={12} className="mr-2"/> 计数器步长 (遍/次)</label>
                        <input type="number" value={configStep} onChange={(e) => setConfigStep(Math.max(1, parseInt(e.target.value) || 0))} className="w-full bg-stone-50 border border-stone-200 p-6 rounded-3xl text-center text-4xl font-mono font-bold text-amber-700 focus:ring-4 focus:ring-amber-100 transition-all outline-none" />
                        <p className="text-[10px] text-stone-400 italic px-2 tracking-tighter">例如：念珠一圈通常为 108 遍，步长可设为 108。</p>
                     </div>
                   )}
                </div>
                <button onClick={async () => { 
                  const text = configuringTask.type === 'sutra' ? `读诵《${configuringTask.text}》` : configuringTask.text;
                  const newTask: Task = { ...configuringTask, text, id: Date.now(), current: 0, completed: false, target: configTarget, step: configStep, dateCreated: new Date().toLocaleDateString() };
                  await LocalDBService.saveTask(newTask);
                  setTasks([...tasks, newTask]);
                  setConfiguringTask(null); 
                  setShowAddModal(false); 
                }} className="w-full h-16 bg-stone-800 text-white rounded-[1.5rem] font-bold text-lg shadow-xl active:scale-95 transition-all">确定请领</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-2 transition-all duration-300 w-16 ${active ? 'text-emerald-800' : 'text-stone-300'}`}>
    <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-emerald-50 shadow-sm' : ''}`}>{icon}</div>
    <span className={`text-[10px] font-bold tracking-widest ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);

export default App;
