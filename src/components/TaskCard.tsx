'use client';

import React from 'react';
import { Circle, CheckCircle2, Edit3, BellRing, BookOpen } from 'lucide-react';
import { ICON_MAP } from '@/constants';
import { updateTaskProgress } from '@/actions/tasks';

interface TaskCardProps {
  task: any;
  onRead: (task: any) => void;
  onComplete?: () => void;
  onProgress: (taskId: string, newCurrent: number, completed: boolean) => void;
}

export default function TaskCard({ task, onRead, onComplete, onProgress }: TaskCardProps) {
  const handleStep = async () => {
    const nextCurrent = (task.current || 0) + (task.step || 1);
    // Optimistic UI update could happen here if we passed a setter, but triggering parent update is safer
    
    const result = await updateTaskProgress(task.id, task.step || 1);
    if (result.success) {
      onProgress(task.id, nextCurrent, result.completed || false);
      if (result.completed) onComplete?.();
    }
  };

  const handleManual = async () => {
    const val = prompt('请输入今日累计圆满遍数:');
    if (val !== null && !isNaN(parseInt(val))) {
      const nextCurrent = parseInt(val);
      const result = await updateTaskProgress(task.id, undefined, nextCurrent);
      if (result.success) {
        onProgress(task.id, nextCurrent, result.completed || false);
        if (result.completed) onComplete?.();
      }
    }
  };

  const handleFinish = async () => {
    const nextCurrent = (task.current || 0) + 1;
    const result = await updateTaskProgress(task.id, 1);
    if (result.success) {
      onProgress(task.id, nextCurrent, result.completed || false);
      if (result.completed) onComplete?.();
    }
  };

  return (
    <div className={`group bg-white p-5 rounded-3xl border transition-all ${task.completed ? 'border-emerald-100 opacity-60 shadow-none' : 'border-stone-100 shadow-sm hover:shadow-md'}`}>
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
                <button onClick={handleManual} className="text-[10px] text-stone-400 flex items-center hover:text-emerald-600 transition-colors">
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
              <button onClick={handleStep} className="flex-1 h-12 bg-stone-100 rounded-2xl text-stone-600 font-bold active:scale-95 transition-all">+{task.step}</button>
              <button onClick={handleFinish} className="flex-1 h-12 bg-emerald-800 text-white rounded-2xl text-sm font-bold shadow-md active:scale-95 flex items-center justify-center">
                <BellRing size={16} className="mr-2"/> 提交
              </button>
            </div>
          ) : task.type === 'sutra' ? (
            <button onClick={() => onRead(task)} className="w-full py-3.5 bg-stone-800 text-white rounded-2xl text-sm font-bold flex items-center justify-center shadow-lg active:scale-95">
              <BookOpen size={18} className="mr-2"/> 开始阅经
            </button>
          ) : (
            <button onClick={handleFinish} className="w-full py-3 bg-stone-50 border border-stone-100 rounded-2xl text-stone-600 text-sm font-medium hover:bg-stone-100 transition-colors">
              标记完成
            </button>
          )}
        </div>
      )}
    </div>
  );
}
