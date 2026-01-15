'use client';

import React from 'react';
import { Circle, CheckCircle2, Edit3, BellRing, BookOpen, Star, Save, Settings2 } from 'lucide-react';
import { ICON_MAP } from '@/constants';
import { updateTaskProgress, updateTask } from '@/actions/tasks';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ConfirmDialog from './ConfirmDialog';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  task: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRead: (task: any) => void;
  onComplete?: () => void;
  onEdit: (task: any) => void;
  onProgress: (taskId: string, newCurrent: number, completed: boolean) => void;
}

export default function TaskCard({ task, onRead, onComplete, onEdit, onProgress }: TaskCardProps) {
  const [isEditingProgress, setIsEditingProgress] = React.useState(false);
  const [editValue, setEditValue] = React.useState(task.current?.toString() || '0');
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleStep = async () => {
    const nextCurrent = (task.current || 0) + (task.step || 1);
    const result = await updateTaskProgress(task.id, task.step || 1);
    if (result.success) {
      onProgress(task.id, nextCurrent, result.completed || false);
      if (result.completed) onComplete?.();
    }
  };

  const handleProgressEditSubmit = async () => {
    const val = parseInt(editValue);
    if (isNaN(val) || val < 0) {
      setIsEditingProgress(false);
      return;
    }

    // Validation: current progress cannot exceed target
    if (task.target && val > task.target) {
      alert(`进度不能超过目标值 ${task.target}`);
      return;
    }

    // Validation: current progress cannot be less than current stored value (monotonic increase)
    if (val < (task.current || 0)) {
      alert(`进度不能小于当前进度 ${task.current || 0}`);
      return;
    }

    setIsEditingProgress(false);
    if (val !== task.current) {
      const result = await updateTask(task.id, {
        current: val,
      });
      if (result.success) {
        const isFinished = task.target ? val >= task.target : true;
        onProgress(task.id, val, isFinished);
        if (isFinished && !task.completed) onComplete?.();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleProgressEditSubmit();
    }
  };

  const handleFinish = async () => {
    // Check if incomplete for counter type
    if (task.type === 'counter' && task.target && (task.current || 0) < task.target) {
      setShowConfirm(true);
      return;
    }

    const countToLog = (task.target && task.target > task.current) ? (task.target - task.current) : 1;
    const nextCurrent = task.target || (task.current + 1);

    const result = await updateTaskProgress(task.id, countToLog);
    if (result.success) {
      onProgress(task.id, nextCurrent, true);
      onComplete?.();
    }
  };

  const handleConfirmSubmit = async (value?: string) => {
    setShowConfirm(false);
    if (value === undefined) return;

    const val = parseInt(value);
    if (isNaN(val) || val < 0) {
      alert("请输入有效的数字");
      return;
    }

    if (task.target && val > task.target) {
      alert(`进度不能超过目标值 ${task.target}`);
      return;
    }

    try {
      // Force completion since user explicitly confirmed "Submit"
      const result = await updateTask(task.id, {
        current: val,
        completed: true
      });

      if (result.success) {
        onProgress(task.id, val, true); // Force UI to show as completed
        onComplete?.();
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("提交失败，请重试");
    }
  };

  const progressPercent = Math.min(100, (((task.current || 0) / (task.target || 1)) * 100));

  return (
    <div className={cn(
      "group bg-white p-6 rounded-[2.5rem] shadow-sm border transition-all duration-500 relative overflow-hidden",
      task.completed ? "border-emerald-100 bg-emerald-50/10" : "border-stone-100"
    )}>
      <ConfirmDialog
        isOpen={showConfirm}
        title="提交确认"
        message={`您今日功课尚未圆满（当前 ${task.current || 0}/${task.target}）。\n\n是否确认提交？`}
        confirmText="确认提交"
        cancelText="取消"
        defaultValue={(task.current || 0).toString()}
        inputType="number"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
      />
      {/* 顶部标题与图标 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-600 shadow-inner">
            {ICON_MAP[task.iconId || ''] || <Circle size={20} />}
          </div>
          <span className={cn(
            "text-lg font-serif tracking-wide",
            task.completed ? "text-stone-400 line-through font-sans" : "text-stone-800"
          )}>
            {task.text}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!task.completed && (
            <div className="flex items-center gap-1">
              {(task.isDaily === true || (task.isDaily as unknown as string) === 'true') && (
                <div className="p-2 text-amber-400" title="每日功课">
                  <Star size={24} className="fill-amber-400" />
                </div>
              )}
              <button
                onClick={() => onEdit(task)}
                className="p-2 text-stone-300 hover:text-emerald-500 transition-all hover:bg-stone-50 rounded-xl active:scale-95"
                title="修持设定"
              >
                <Settings2 size={24} />
              </button>
            </div>
          )}
          {task.completed && <CheckCircle2 className="text-emerald-500 animate-in zoom-in duration-300" size={28} />}
        </div>
      </div>

      {!task.completed && (
        <div className="space-y-6">
          {/* 进度数值与修改按钮 (严谨实现 0/100) */}
          <div className={cn(
            "p-5 rounded-3xl border transition-all duration-300",
            isEditingProgress ? "bg-emerald-50/30 border-emerald-100" : "bg-stone-50/50 border-stone-100/50"
          )}>
            <div className="flex items-end justify-between mb-3">
              <div className="flex items-baseline gap-1 w-full">
                {isEditingProgress ? (
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="text-4xl font-serif text-stone-800 bg-white border border-stone-200 rounded-xl px-2 w-40 focus:outline-none focus:ring-2 focus:ring-stone-300"
                  />
                ) : (
                  <span
                    onClick={() => { setEditValue(task.current?.toString() || '0'); setIsEditingProgress(true); }}
                    className="text-4xl font-serif text-stone-800 tabular-nums cursor-pointer hover:text-stone-500 transition-colors"
                  >
                    {task.current || 0}
                  </span>
                )}

                <span className="text-2xl font-medium text-stone-300 mx-1">/</span>
                <span className="text-xl font-serif text-stone-300">
                  {task.target || 0}
                </span>
                <span className="ml-2 text-[10px] text-stone-300 uppercase tracking-[0.3em]">次</span>
              </div>

              <div className="flex gap-2">
                {isEditingProgress ? (
                  <button
                    onClick={handleProgressEditSubmit}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs hover:bg-emerald-200 transition-all shadow-sm active:scale-95"
                  >
                    <Save size={12} />
                    保存
                  </button>
                ) : (
                  <button
                    onClick={() => { setEditValue(task.current?.toString() || '0'); setIsEditingProgress(true); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-stone-50 rounded-full text-xs text-stone-600 hover:text-stone-800 border border-stone-100 transition-all shadow-sm whitespace-nowrap"
                  >
                    <Edit3 size={12} />
                    修改进度
                  </button>
                )}
              </div>
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
          {!isEditingProgress && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
              {task.type === 'counter' ? (
                <>
                  <button
                    onClick={handleStep}
                    className="flex-[2] h-14 bg-white border border-stone-100 text-stone-700 rounded-2xl text-base font-serif shadow-sm active:scale-95 transition-all flex items-center justify-center hover:bg-stone-50"
                  >
                    <span className="text-stone-300 mr-2 text-xs font-sans italic tracking-widest uppercase">进步</span>
                    +{task.step || 1}
                  </button>
                  <button
                    onClick={handleFinish}
                    className="flex-1 h-14 bg-white border border-stone-100 text-stone-700 rounded-2xl shadow-sm active:scale-95 transition-all flex items-center justify-center hover:bg-stone-50 gap-2 tracking-widest"
                  >
                    <BellRing size={18} className="opacity-70" />
                    <span>提交</span>
                  </button>
                </>
              ) : task.type === 'sutra' ? (
                <button
                  onClick={() => onRead(task)}
                  className="w-full h-14 bg-white border border-stone-100 text-stone-700 rounded-2xl text-base tracking-[0.3em] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-stone-50"
                >
                  <BookOpen size={20} className="opacity-70" />
                  <span>开始阅经</span>
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="w-full h-14 bg-white border border-stone-100 text-stone-700 rounded-2xl text-base shadow-sm active:scale-95 transition-all flex items-center justify-center hover:bg-stone-50"
                >
                  标记完成
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
