'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Settings2, Hash, BookOpen } from 'lucide-react';
import { PRESET_LIBRARY, ICON_MAP } from '@/constants';
import { createTask, getAvailableSutras } from '@/actions/tasks';

export default function AddTaskModal({ isOpen, onClose, onTaskCreated }: { isOpen: boolean; onClose: () => void; onTaskCreated?: (task: any) => void }) {
  const [configuringTask, setConfiguringTask] = useState<any | null>(null);
  const [configTarget, setConfigTarget] = useState(1);
  const [configStep, setConfigStep] = useState(1);
  const [dbSutras, setDbSutras] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      getAvailableSutras().then(setDbSutras);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (item: any) => {
    setConfiguringTask(item);
    setConfigTarget(1);
    // Default step logic: Sutra = 1, Counter (default) = 108 unless specified
    setConfigStep(item.type === 'sutra' ? 1 : (item.id === 'lyz' ? 1 : 108));
  };

  const handleConfirm = async () => {
    const text = configuringTask.type === 'sutra' ? `读诵《${configuringTask.text}》` : configuringTask.text;
    const newTask = await createTask({
      text,
      type: configuringTask.type,
      iconId: configuringTask.iconId,
      sutraId: configuringTask.sutraId, // This might be the DB ID for sutras
      target: configTarget,
      step: configuringTask.type === 'sutra' ? 1 : configStep, // Force step 1 for Sutra
    });
    
    if (onTaskCreated) {
      onTaskCreated(newTask);
    }
    
    setConfiguringTask(null);
    onClose();
  };

  // Merge presets with DB sutras
  const displayItems = [
    ...PRESET_LIBRARY.filter(p => p.type !== 'sutra'), // Non-sutra presets
    ...dbSutras.map(s => ({
      id: s.id,
      text: s.title,
      type: 'sutra',
      iconId: 'book',
      sutraId: s.id
    }))
  ];

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[120] flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[95dvh] overflow-y-auto">
        {!configuringTask ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-stone-800">请领功课</h3>
              <button onClick={onClose} className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="space-y-3 pb-8">
              {displayItems.map((item: any) => (
                <button key={item.id} onClick={() => handleSelectPreset(item)} className="w-full flex items-center p-5 bg-stone-50 rounded-[1.5rem] border border-transparent hover:border-emerald-200 transition-all hover:bg-emerald-50 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform">
                    {ICON_MAP[item.iconId || ''] || <BookOpen className="text-blue-600" size={18}/>}
                  </div>
                  <div className="text-left flex-1">
                    <span className="font-bold text-stone-800 block">{item.text}</span>
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
              <h3 className="text-2xl font-bold text-stone-800">修持设定</h3>
            </div>
            <div className="space-y-8 mb-10">
               <div className="text-center py-6 bg-stone-50 rounded-[2rem] border border-stone-100 mb-4">
                  <div className="scale-150 flex justify-center mb-2">{ICON_MAP[configuringTask.iconId || ''] || <BookOpen className="text-blue-600" size={18}/>}</div>
                  <p className="font-bold text-lg text-stone-800">{configuringTask.text}</p>
               </div>
               <div className="space-y-4">
                  <label className="text-xs font-bold text-stone-400 tracking-[0.2em] flex items-center">
                    <Settings2 size={12} className="mr-2"/> 每日发愿目标 (遍/日)
                  </label>
                  <input type="number" value={configTarget} onChange={(e) => setConfigTarget(Math.max(1, parseInt(e.target.value) || 0))} className="w-full bg-stone-50 border border-stone-200 p-6 rounded-3xl text-center text-4xl font-mono font-bold text-emerald-800 focus:ring-4 focus:ring-emerald-100 transition-all outline-none" />
               </div>
               
               {/* Only show step configuration for non-sutra tasks */}
               {configuringTask.type !== 'sutra' && (
                 <div className="space-y-4">
                    <label className="text-xs font-bold text-stone-400 tracking-[0.2em] flex items-center">
                      <Hash size={12} className="mr-2"/> 计数器步长 (遍/次)
                    </label>
                    <input type="number" value={configStep} onChange={(e) => setConfigStep(Math.max(1, parseInt(e.target.value) || 0))} className="w-full bg-stone-50 border border-stone-200 p-6 rounded-3xl text-center text-4xl font-mono font-bold text-amber-700 focus:ring-4 focus:ring-amber-100 transition-all outline-none" />
                    <p className="text-[10px] text-stone-400 italic px-2 tracking-tighter">例如：念珠一圈通常为 108 遍，步长可设为 108。</p>
                 </div>
               )}
            </div>
            <button onClick={handleConfirm} className="w-full h-16 bg-stone-800 text-white rounded-[1.5rem] font-bold text-lg shadow-xl active:scale-95 transition-all">
              确定请领
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
