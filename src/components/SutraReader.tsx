'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Brain, Loader2, Sparkles, Check } from 'lucide-react';
import { getGuidance } from '@/actions/ai';
import { updateTaskProgress, getSutraContent } from '@/actions/tasks';

interface SutraReaderProps {
  task: any;
  onBack: () => void;
  onComplete?: () => void;
  onProgress?: (taskId: string, newCurrent: number, completed: boolean) => void;
}

export default function SutraReader({ task, onBack, onComplete, onProgress }: SutraReaderProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [sutraContent, setSutraContent] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    async function loadSutra() {
      if (task.sutraId && task.sutraId !== "") {
        try {
                  const dbSutra = await getSutraContent(task.sutraId);
                  if (dbSutra) {
                    setSutraContent({
                      title: dbSutra.title,
                      content: dbSutra.content || '暂无内容'
                    });
                    return;
                  }        } catch (error) {
          console.error("Failed to fetch sutra content from DB:", error);
        }
      }
      
      // Fallback
      setSutraContent({ title: task.text, content: '暂无经文内容，请在管理后台检查经文设置或静心念诵。' });
    }
    loadSutra();
  }, [task]);

  if (!sutraContent) {
    return (
      <div className="h-full flex items-center justify-center text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> 加载经文中...
      </div>
    );
  }

  const handleAiInsight = async () => {
    setAiLoading(true);
    const result = await getGuidance(sutraContent.content);
    if (result.success && result.insight) {
      setAiResponse(result.insight);
    }
    setAiLoading(false);
  };

  const handleSubmit = async () => {
    const nextCurrent = (task.current || 0) + 1;
    const result = await updateTaskProgress(task.id, 1);
    
    if (result.success) {
      if (onProgress) {
        onProgress(task.id, nextCurrent, result.completed || false);
      }
      if (result.completed) onComplete?.();
    }
    onBack();
  };

  return (
    <div className="animate-in fade-in slide-in-from-right duration-300 h-full flex flex-col py-4">
      <button onClick={onBack} className="mb-4 flex items-center text-stone-500 text-sm font-medium">
        <ChevronLeft size={18} className="mr-1" /> 返回功课
      </button>
      <h2 className="text-2xl font-serif text-stone-800 tracking-wide text-center mb-8">《{sutraContent.title}》</h2>
      <div className="flex-1 overflow-y-auto p-8 bg-stone-50/30 rounded-[2.5rem] border border-stone-100/50 text-xl leading-loose text-stone-700 font-serif tracking-wide whitespace-pre-wrap mb-8">
        {sutraContent.content}
      </div>
      
      <div className="space-y-6 pb-12">
        <button onClick={handleAiInsight} disabled={aiLoading} className="w-full py-4 bg-white border border-stone-200 text-stone-600 rounded-2xl flex items-center justify-center space-x-2 font-medium hover:bg-stone-50 transition-colors">
          {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} className="text-stone-400" />}
          <span className="font-serif italic tracking-wider">AI 禅意开解</span>
        </button>

        {aiResponse && (
          <div className="p-6 bg-white border border-stone-100 rounded-[2rem] animate-in zoom-in-95 duration-500">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-emerald-600/60 mb-3 flex items-center justify-center">
              <Sparkles size={12} className="mr-2"/> 智慧启迪
            </h4>
            <p className="text-base text-stone-600 font-serif leading-relaxed italic text-center px-4">{aiResponse}</p>
          </div>
        )}

        <button onClick={handleSubmit} className="w-full py-4 bg-emerald-100 text-emerald-700 rounded-2xl tracking-[0.2em] flex items-center justify-center space-x-2 shadow-sm active:scale-95 transition-all">
          <Check size={20} />
          <span>读诵圆满</span>
        </button>
      </div>
    </div>
  );
}
