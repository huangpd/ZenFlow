'use client';

import { useActionState, useState, useEffect } from 'react';
import { createJournalEntry, deleteJournalEntry } from '@/actions/journal';
import { Loader2, Trash2, PenLine, Search, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CelebrationEffect from './CelebrationEffect';
import { CATEGORIES } from '@/constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function JournalSection({ entries }: { entries: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('感悟');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
  const [state, formAction, pending] = useActionState(createJournalEntry, null);

  useEffect(() => {
    if (state?.success) {
      setIsExpanded(false);
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          entry.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory ? entry.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {showCelebration && <CelebrationEffect />}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-2">
          随喜日记
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => { setIsSearchMode(!isSearchMode); if(isSearchMode) { setSearchQuery(''); setFilterCategory(null); } }} 
            className={cn("p-2 rounded-full transition-all", isSearchMode ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-600")}
          >
            {isSearchMode ? <X size={20} /> : <Search size={20} />}
          </button>
          {!isSearchMode && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-stone-100 rounded-full active:bg-stone-200 transition-colors"
            >
              <PenLine size={20} className={cn(isExpanded && "text-emerald-600")} />
            </button>
          )}
        </div>
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
              className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all border", filterCategory === null ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-400 border-stone-100")}
            >
              全部
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.label} 
                onClick={() => setFilterCategory(cat.label)}
                className={cn("flex items-center space-x-1.5 px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all border", filterCategory === cat.label ? "bg-stone-800 text-white border-stone-800 shadow-md scale-105" : "bg-white text-stone-400 border-stone-100")}
              >
                {cat.icon}<span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isExpanded && !isSearchMode && (
        <form action={formAction} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button 
                type="button"
                key={cat.label} 
                onClick={() => setSelectedCategory(cat.label)} 
                className={cn("flex items-center space-x-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all border", selectedCategory === cat.label ? "bg-stone-800 text-white border-stone-800 shadow-md scale-105" : "bg-white text-stone-500 border-stone-100")}
              >
                {cat.icon}<span>{cat.label}</span>
              </button>
            ))}
          </div>
          <input type="hidden" name="category" value={selectedCategory} />
          <textarea
            name="content"
            rows={4}
            placeholder={`记录此刻的${selectedCategory}...`}
            className="w-full p-3 bg-transparent border-none outline-none text-stone-700 placeholder:text-stone-300 resize-none"
            required
          />
          <div className="flex justify-end gap-2 pt-2 border-t">
            {state?.error && <p className="text-sm text-red-600 self-center mr-auto">{state.error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="px-6 py-2 bg-stone-800 text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-stone-700 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
            >
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              存入功德
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-stone-300 italic flex flex-col items-center gap-2">
            <X size={40} strokeWidth={1} />
            <p className="text-xs tracking-widest">空空如也 · 静待花开</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group relative border border-stone-50/50">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] text-stone-400 font-mono tracking-widest uppercase bg-stone-50 px-3 py-1 rounded-full">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
                <span className={cn("px-3 py-1 text-[10px] font-bold rounded-full", CATEGORIES.find(c => c.label === entry.category)?.color)}>
                  {entry.category}
                </span>
              </div>
              <p className="text-sm text-stone-600 leading-loose whitespace-pre-wrap font-serif tracking-wide">{entry.content}</p>
              
              <button
                onClick={async () => {
                   if(confirm('Delete this entry?')) {
                     await deleteJournalEntry(entry.id);
                   }
                }}
                className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}