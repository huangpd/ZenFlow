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
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(task.current?.toString() || '0');

  const handleStep = async () => {
    const nextCurrent = (task.current || 0) + (task.step || 1);
    const result = await updateTaskProgress(task.id, task.step || 1);
    if (result.success) {
      onProgress(task.id, nextCurrent, result.completed || false);
      if (result.completed) onComplete?.();
    }
  };

  const handleEditSubmit = async () => {
    setIsEditing(false);
    const val = parseInt(editValue);
    if (!isNaN(val) && val !== task.current) {
      const result = await updateTaskProgress(task.id, undefined, val);
      if (result.success) {
        onProgress(task.id, val, result.completed || false);
        if (result.completed) onComplete?.();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    }
  };

  const handleFinish = async () => {
    // For normal tasks, if there is a target (e.g. 10 times), we log the full target amount at once.
    const countToLog = (task.target && task.target > task.current) ? (task.target - task.current) : 1;
    const nextCurrent = task.target || (task.current + 1);
    
    const result = await updateTaskProgress(task.id, countToLog);
    if (result.success) {
      onProgress(task.id, nextCurrent, true);
      onComplete?.();
    }
  };

  const progressPercent = Math.min(100, (((task.current || 0) / (task.target || 1)) * 100));

  return (
    <div className={cn(
      "group bg-white p-6 rounded-[2.5rem] shadow-sm border transition-all duration-500",
      task.completed ? "border-emerald-100 bg-emerald-50/10" : "border-stone-100"
    )}>
      {/* 顶部标题与图标 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-600 shadow-inner">
            {ICON_MAP[task.iconId || ''] || <Circle size={20}/>}
          </div>
          <span className={cn(
            "text-xl font-bold tracking-tight",
            task.completed ? "text-stone-400 line-through" : "text-stone-800"
          )}>
            {task.text}
          </span>
        </div>
        {task.completed && <CheckCircle2 className="text-emerald-500 animate-in zoom-in duration-300" size={28}/>}
      </div>
      
      {!task.completed && (
        <div className="space-y-6">
          {/* 进度数值与修改按钮 (严谨实现 0/100) */}
          <div className="bg-stone-50/50 p-5 rounded-3xl border border-stone-100/50">
            <div className="flex items-end justify-between mb-3">
              <div className="flex items-baseline gap-1 w-full">
                {isEditing ? (
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleEditSubmit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="text-5xl font-mono font-extrabold text-stone-900 bg-white border border-emerald-200 rounded-xl px-2 w-48 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  />
                ) : (
                  <span 
                    onClick={() => { setEditValue(task.current?.toString() || '0'); setIsEditing(true); }}
                    className="text-5xl font-mono font-extrabold text-stone-900 tabular-nums cursor-pointer hover:text-emerald-700 transition-colors"
                  >
                    {task.current || 0}
                  </span>
                )}
                
                <span className="text-2xl font-medium text-stone-300 mx-1">/</span>
                <span className="text-2xl font-mono font-bold text-stone-400">
                  {task.target || 0}
                </span>
                <span className="ml-2 text-xs font-bold text-stone-400 uppercase tracking-widest">次</span>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => { setEditValue(task.current?.toString() || '0'); setIsEditing(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-xs font-bold text-stone-500 hover:text-emerald-600 hover:border-emerald-200 border border-stone-200 transition-all shadow-sm whitespace-nowrap"
                >
                  <Edit3 size={12} />
                  修改
                </button>
              )}
            </div>

            {/* 进度条 (严谨实现) */}
            <div className="w-full h-4 bg-stone-200/50 rounded-full overflow-hidden shadow-inner">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-out shadow-sm",
                  task.type === 'sutra' ? 'bg-emerald-500' : 'bg-amber-500'
                )} 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          
          {/* 操作按钮区 */}
          <div className="flex gap-3">
            {task.type === 'counter' ? (
              <>
                <button 
                  onClick={handleStep} 
                  className="flex-[2] h-16 bg-white border-2 border-stone-100 text-stone-800 rounded-2xl text-xl font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center hover:bg-stone-50 hover:border-stone-200"
                >
                  <span className="text-stone-400 mr-2 text-sm font-normal">点击</span>
                  +{task.step || 1}
                </button>
                <button 
                  onClick={handleFinish} 
                  className="flex-1 h-16 bg-stone-800 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center hover:bg-stone-900 gap-2"
                >
                  <BellRing size={20} />
                  <span>提交</span>
                </button>
              </>
            ) : task.type === 'sutra' ? (
              <button 
                onClick={() => onRead(task)} 
                className="w-full h-16 bg-stone-800 text-white rounded-2xl text-lg font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-stone-900"
              >
                <BookOpen size={22} />
                <span>开始阅经</span>
              </button>
            ) : (
              <button 
                onClick={handleFinish} 
                className="w-full h-16 bg-white border-2 border-stone-800 text-stone-800 rounded-2xl text-lg font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center hover:bg-stone-50"
              >
                标记完成
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}