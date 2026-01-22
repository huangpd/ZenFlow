'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Brain, Loader2, Sparkles, Check } from 'lucide-react';
import { getGuidance } from '@/actions/ai';
import { updateTaskProgress, getSutraContent } from '@/actions/tasks';
import 'react-quill-new/dist/quill.snow.css'; // 导入 Quill 样式

interface SutraReaderProps {
  task: any;
  onBack: () => void;
  onComplete?: () => void;
  onProgress?: (taskId: string, newCurrent: number, completed: boolean) => void;
}

export default function SutraReader({ task, onBack, onComplete, onProgress }: SutraReaderProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
          }
        } catch (error) {
          console.error("Failed to fetch sutra content from DB:", error);
          // console.error("Failed to fetch sutra content from DB:", error);
        }
      }

      // Fallback
      setSutraContent({ title: task.text, content: '暂无经文内容，请在管理后台检查经文设置或静心念诵。' });
    }

    loadSutra();

    // Android 返回键支持
    // 添加一个历史记录条目
    window.history.pushState({ modal: 'sutra-reader' }, '');

    const handlePopState = (event: PopStateEvent) => {
      // 当用户按返回键时,触发 onBack
      onBack();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // 清理历史记录(如果组件正常卸载)
      if (window.history.state?.modal === 'sutra-reader') {
        window.history.back();
      }
    };
  }, [task, onBack]);

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
      const cleaned = result.insight.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      setAiResponse(cleaned);
    }
    setAiLoading(false);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const nextCurrent = (task.current || 0) + 1;
      const result = await updateTaskProgress(task.id, 1);

      if (result.success) {
        if (onProgress) {
          onProgress(task.id, nextCurrent, result.completed || false);
        }
        if (result.completed) onComplete?.();
      }
      onBack();
    } catch (error) {
      // console.error("Submission error:", error);
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right duration-300 h-full flex flex-col py-4">
      <button onClick={onBack} className="mb-4 flex items-center text-stone-500 text-sm font-medium">
        <ChevronLeft size={18} className="mr-1" /> 返回功课
      </button>
      <h2 className="text-2xl font-serif text-stone-800 tracking-wide text-center mb-8">《{sutraContent.title}》</h2>
      <div
        className="flex-1 overflow-y-auto p-8 bg-stone-50/30 rounded-[2.5rem] border border-stone-100/50 text-xl leading-loose text-stone-700 font-serif tracking-wide mb-8 prose prose-stone max-w-none prose-p:my-4 prose-img:rounded-xl prose-img:mx-auto prose-img:shadow-sm"
        dangerouslySetInnerHTML={{ __html: sutraContent.content }}
      />

      <div className="space-y-6 pb-12">
        <button onClick={handleAiInsight} disabled={aiLoading} className="w-full py-4 bg-white border border-stone-200 text-stone-600 rounded-2xl flex items-center justify-center space-x-2 font-medium hover:bg-stone-50 transition-colors">
          {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} className="text-stone-400" />}
          <span className="font-serif italic tracking-wider">AI 禅意开解</span>
        </button>

        {aiResponse && (
          <div className="p-6 bg-white border border-stone-100 rounded-[2rem] animate-in zoom-in-95 duration-500">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-emerald-600/60 mb-3 flex items-center justify-center">
              <Sparkles size={12} className="mr-2" /> 智慧启迪
            </h4>
            <p className="text-base text-stone-600 font-serif leading-relaxed italic text-center px-4">{aiResponse}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-emerald-100 text-emerald-700 rounded-2xl tracking-[0.2em] flex items-center justify-center space-x-2 shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
          <span>{submitting ? '提交中...' : '读诵圆满'}</span>
        </button>
      </div>
    </div>
  );
}
