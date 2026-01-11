'use client';

import React from 'react';
import { Circle, CheckCircle2, Edit3, BellRing, BookOpen } from 'lucide-react';
import { ICON_MAP } from '@/constants';
import { updateTaskProgress } from '@/actions/tasks';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    // For normal tasks, if there is a target (e.g. 10 times), we log the full target amount at once.
    const countToLog = (task.target && task.target > 0) ? task.target : 1;
    const nextCurrent = (task.current || 0) + countToLog;
    
    const result = await updateTaskProgress(task.id, countToLog);
    if (result.success) {
      onProgress(task.id, nextCurrent, result.completed || false);
      if (result.completed) onComplete?.();
    }
  };

  return (
    <div className={`group bg-white p-5 rounded-[2rem] border transition-all ${task.completed ? 'border-emerald-100 opacity-60 shadow-none' : 'border-stone-100 shadow-sm hover:shadow-md'}`}>
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
        <div className="space-y-6">
          {/* Progress Display */}
          {(task.type === 'counter' || (task.target && task.target > 1)) && (
            <div className="flex flex-col space-y-3 px-2">
              <div className="flex items-end justify-between">
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-mono font-bold text-stone-800 tracking-tighter leading-none">
                    {task.current || 0}
                  </span>
                  <span className="text-xl font-medium text-stone-300">/</span>
                  <span className="text-2xl font-mono font-bold text-stone-400">
                    {task.target || 0}
                  </span>
                </div>
                <button 
                  onClick={handleManual} 
                  className="mb-1 px-4 py-1.5 bg-stone-50 rounded-full text-xs font-bold text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors border border-stone-100"
                >
                  修改
                </button>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000 ease-out",
                    task.type === 'sutra' ? 'bg-emerald-500' : 'bg-stone-800'
                  )} 
                  style={{ width: `${Math.min(100, ((task.current || 0) / (task.target || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="px-1">
            {task.type === 'counter' ? (
            <div className="flex gap-3">
              <button 
                onClick={handleStep} 
                className="flex-1 h-14 bg-stone-100 text-stone-800 rounded-2xl text-lg font-bold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center hover:bg-stone-200"
              >
                <span>+{task.step || 1}</span>
              </button>
              <button 
                onClick={handleFinish} 
                className="w-1/3 h-14 bg-stone-800 text-white rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center hover:bg-stone-900"
              >
                <BellRing size={20} />
              </button>
            </div>
          ) : task.type === 'sutra' ? (
            <button onClick={() => onRead(task)} className="w-full h-14 bg-emerald-800 text-white rounded-2xl text-lg font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2 hover:bg-emerald-900">
              <BookOpen size={18} />
              <span>开始阅经</span>
            </button>
          ) : (
            <button onClick={handleFinish} className="w-full h-14 bg-stone-50 border-2 border-stone-100 rounded-2xl text-stone-600 text-lg font-bold hover:bg-stone-100 hover:border-stone-200 transition-all active:scale-[0.98]">
              标记完成
            </button>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
