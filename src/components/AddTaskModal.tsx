import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Settings2, BookOpen, Save, Loader2 } from 'lucide-react';
import { ICON_MAP } from '@/constants';
import { createTask, getAvailableSutras, updateTask, checkExistingTask } from '@/actions/tasks';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AddTaskModal({ 
  isOpen, 
  onClose, 
  onTaskCreated,
  onTaskUpdated,
  taskToEdit 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onTaskCreated?: (task: any) => void;
  onTaskUpdated?: (task: any) => void;
  taskToEdit?: any;
}) {
  const [configuringTask, setConfiguringTask] = useState<any | null>(null);
  const [configTarget, setConfigTarget] = useState<number | string>(1);
  const [isDaily, setIsDaily] = useState(false);
  const [dbSutras, setDbSutras] = useState<any[]>([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getAvailableSutras().then(setDbSutras);
      
      if (taskToEdit) {
        // Initialize state for editing
        const text = taskToEdit.text.startsWith("读诵《") && taskToEdit.text.endsWith("》") 
          ? taskToEdit.text.slice(3, -1) 
          : taskToEdit.text;
          
        setConfiguringTask({
          ...taskToEdit,
          text
        });
        setConfigTarget(taskToEdit.target || 1);
        setIsDaily(taskToEdit.isDaily || false);
      } else {
        setConfiguringTask(null);
        setConfigTarget(1);
        setIsDaily(false);
      }
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSelectPreset = async (item: any) => {
    const text = item.type === 'sutra' ? `读诵《${item.text}》` : item.text;
    
    // Check if task already exists to preserve settings
    const existing = await checkExistingTask(item.sutraId, text);
    
    // Create draft task object
    // If existing found, use its values and ID
    const draftTask = {
      id: existing?.id,
      text,
      type: item.type,
      iconId: item.iconId,
      sutraId: item.sutraId,
      step: existing?.step || item.step || 1,
      target: existing?.target || 1,
      isDaily: existing ? existing.isDaily : false
    };
    
    // Switch to configuration mode with draft
    setConfiguringTask(draftTask);
    setConfigTarget(draftTask.target);
    setIsDaily(draftTask.isDaily);
  };

  const updateDailyStatus = async (val: boolean) => {
    setIsDaily(val);
    const targetTask = taskToEdit || configuringTask;
    if (targetTask?.id) {
      const result = await updateTask(targetTask.id, { isDaily: val });
      if (result.success && onTaskUpdated) {
        onTaskUpdated(result.task);
        // Sync UI with actual DB state
        setIsDaily(result.task.isDaily);
      }
    }
  };

  const handleManualSave = async () => {
    setIsSavingSettings(true);
    const targetTask = taskToEdit || configuringTask;
    if (targetTask?.id) {
      try {
        const result = await updateTask(targetTask.id, { isDaily: isDaily });
        if (result.success && onTaskUpdated) {
          onTaskUpdated(result.task);
          setIsDaily(result.task.isDaily);
        }
      } catch (error) {
        console.error("Manual save error:", error);
      } finally {
        setIsSavingSettings(false);
      }
    }
  };

  const updateTargetValue = async (val: string | number) => {
    setConfigTarget(val);
    
    const numVal = typeof val === 'string' ? parseInt(val) : val;
    
    // Only update backend if valid number >= 1
    if (!isNaN(numVal) && numVal >= 1) {
      const targetTask = taskToEdit || configuringTask;
      if (targetTask?.id) {
        const result = await updateTask(targetTask.id, { target: numVal });
        if (result.success && onTaskUpdated) {
          onTaskUpdated(result.task);
        }
      }
    }
  };

  const handleTargetBlur = async () => {
    let finalVal = 1;
    if (typeof configTarget === 'number') {
      finalVal = Math.max(1, configTarget);
    } else {
      const parsed = parseInt(configTarget);
      finalVal = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }

    if (finalVal !== configTarget) {
      setConfigTarget(finalVal);
      const targetTask = taskToEdit || configuringTask;
      if (targetTask?.id) {
        const result = await updateTask(targetTask.id, { target: finalVal });
        if (result.success && onTaskUpdated) {
          onTaskUpdated(result.task);
        }
      }
    }
  };

  const handleConfirm = async () => {
    if (configuringTask && !configuringTask.id) {
      // It is a new draft task, create it now
      try {
        const newTask = await createTask({
          text: configuringTask.text,
          type: configuringTask.type,
          iconId: configuringTask.iconId,
          sutraId: configuringTask.sutraId,
          target: typeof configTarget === 'string' ? parseInt(configTarget) : configTarget,
          step: configuringTask.step || 1,
          isDaily: isDaily,
        });
        
        if (onTaskCreated) {
          onTaskCreated(newTask);
        }
      } catch (error) {
        console.error("Create Task Error:", error);
        return;
      }
    }

    setConfiguringTask(null);
    onClose();
  };

  const displayItems = dbSutras.map(s => ({
    id: s.id,
    text: s.title,
    type: s.type,
    iconId: s.iconId,
    sutraId: s.id,
    step: s.defaultStep || 1
  }));

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[120] flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[95dvh] overflow-y-auto">
        {!configuringTask ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif text-stone-800 tracking-wide">请领功课</h3>
              <button onClick={onClose} className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="space-y-3 pb-8">
              {displayItems.map((item: any) => (
                <button key={item.id} onClick={() => handleSelectPreset(item)} className="w-full flex items-center p-5 bg-stone-50 rounded-[1.5rem] border border-stone-100 hover:border-emerald-100 transition-all hover:bg-stone-100 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform">
                    {ICON_MAP[item.iconId || ''] || <BookOpen className="text-blue-600" size={18}/>}
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-stone-800 block">{item.text}</span>
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest">{item.type}</span>
                  </div>
                  <Plus size={18} className="text-stone-300" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-in slide-in-from-right duration-300">
            <div className="flex items-center mb-8">
              <button onClick={() => setConfiguringTask(null)} className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center mr-3">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-2xl font-serif text-stone-800 tracking-wide">{taskToEdit ? "修改设定" : "修持设定"}</h3>
            </div>
            <div className="space-y-8 mb-10">
               <div className="text-center py-6 bg-stone-50 rounded-[2rem] border border-stone-100 mb-4">
                  <div className="scale-150 flex justify-center mb-2">{ICON_MAP[configuringTask.iconId || ''] || <BookOpen className="text-blue-600" size={18}/>}</div>
                  <p className="text-lg text-stone-800">{configuringTask.text}</p>
               </div>

               <div className="flex items-center justify-between px-6 py-4 bg-stone-50 rounded-3xl border border-stone-100 transition-colors">
                  <div 
                    className="flex flex-col flex-1 cursor-pointer"
                    onClick={() => updateDailyStatus(!isDaily)}
                  >
                    <span className="text-sm text-stone-800">设为每日功课</span>
                    <span className="text-[10px] text-stone-400">每天凌晨自动重置进度</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {configuringTask.id && (
                      <button 
                        onClick={handleManualSave}
                        disabled={isSavingSettings}
                        className="p-2 bg-stone-100 text-stone-500 rounded-full hover:bg-stone-200 active:scale-90 transition-all"
                        title="保存设置"
                      >
                        {isSavingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      </button>
                    )}
                    <div 
                      onClick={() => updateDailyStatus(!isDaily)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative cursor-pointer",
                        isDaily ? "bg-emerald-500" : "bg-stone-300"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                        isDaily ? "right-1" : "left-1"
                      )} />
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-xs font-bold text-stone-400 tracking-[0.2em] flex items-center">
                    <Settings2 size={12} className="mr-2"/> 每日发愿目标 (遍/日)
                  </label>
                  <input 
                    type="number" 
                    value={configTarget} 
                    onChange={(e) => updateTargetValue(e.target.value)} 
                    onBlur={handleTargetBlur}
                    className="w-full bg-stone-50 border border-stone-200 p-6 rounded-3xl text-center text-3xl font-serif text-emerald-700 focus:ring-2 focus:ring-stone-300 transition-all outline-none" 
                  />
               </div>
            </div>
            <button onClick={handleConfirm} className="w-full h-14 bg-emerald-100 text-emerald-700 rounded-[1.5rem] text-base shadow-sm active:scale-95 transition-all hover:bg-emerald-200">
              {configuringTask?.id ? "完成" : "确认请领"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}