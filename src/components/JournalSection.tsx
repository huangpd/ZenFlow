'use client';

import { useActionState, useState, useEffect } from 'react';
import { createJournalEntry, deleteJournalEntry } from '@/actions/journal';
import { Loader2, Trash2, Search, X, Image as ImageIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CelebrationEffect from './CelebrationEffect';
import { CATEGORIES } from '@/constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function JournalSection({ entries }: { entries: any[] }) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('感悟');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
  const [state, formAction, pending] = useActionState(createJournalEntry, null);

  useEffect(() => {
    if (state?.success) {
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
    <div className="space-y-8 pb-32 max-w-md mx-auto">
      {showCelebration && <CelebrationEffect />}

      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-4xl font-bold text-stone-900 tracking-tight">
          随喜日记
        </h2>
        <button 
          onClick={() => { setIsSearchMode(!isSearchMode); if(isSearchMode) { setSearchQuery(''); setFilterCategory(null); } }} 
          className="p-3 bg-stone-50 rounded-full hover:bg-stone-100 transition-colors"
        >
          {isSearchMode ? <X size={24} className="text-stone-600" /> : <Search size={24} className="text-stone-600" />}
        </button>
      </div>

      {/* Category Navigation */}
      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide px-2">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.label} 
            onClick={() => {
              if (isSearchMode) setFilterCategory(cat.label === filterCategory ? null : cat.label);
              else setSelectedCategory(cat.label);
            }} 
            className={cn(
              "flex items-center space-x-2 px-6 py-3 rounded-full whitespace-nowrap text-sm font-bold transition-all border shrink-0",
              (isSearchMode ? filterCategory === cat.label : selectedCategory === cat.label)
                ? "bg-stone-800 text-white border-stone-800 shadow-lg" 
                : "bg-white text-stone-500 border-stone-100"
            )}
          >
            {cat.icon}<span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search Input (Conditional) */}
      {isSearchMode && (
        <div className="px-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <input 
            type="text" 
            placeholder="搜索感悟、分类或关键词..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-100 px-6 py-4 rounded-[2rem] text-sm outline-none focus:ring-2 focus:ring-stone-200"
          />
        </div>
      )}

      {/* Input Card */}
      {!isSearchMode && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-stone-50 space-y-6 relative mx-2">
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="category" value={selectedCategory} />
            <textarea
              name="content"
              rows={5}
              placeholder={`记录此刻的${selectedCategory}...`}
              className="w-full p-0 bg-transparent border-none outline-none text-lg text-stone-700 placeholder:text-stone-300 resize-none leading-relaxed"
              required
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 py-5 bg-stone-800 text-white rounded-[1.5rem] font-bold text-lg shadow-xl hover:bg-stone-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                存入功德
              </button>
              <button 
                type="button"
                className="w-16 h-16 bg-[#FDF5E6] text-[#8B4513] rounded-2xl flex items-center justify-center hover:bg-[#FAEBD7] transition-colors"
              >
                <ImageIcon size={28} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entry List Section */}
      <div className="space-y-6 px-2">
        <h3 className="text-sm font-bold text-stone-300 tracking-widest uppercase px-1">
          {isSearchMode ? '搜索结果' : '近期随喜'}
        </h3>
        
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-stone-300 italic flex flex-col items-center gap-2">
              <p className="text-xs tracking-widest">空空如也 · 静待花开</p>
            </div>
          ) : (
            filteredEntries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm group relative">
                <div className="flex justify-between items-center mb-3">
                  <span className={cn("px-3 py-1 text-[10px] font-bold rounded-full", CATEGORIES.find(c => c.label === entry.category)?.color)}>
                    {entry.category}
                  </span>
                  <span className="text-[10px] text-stone-300 font-mono tracking-wider">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                <button
                  onClick={async () => {
                     if(confirm('Delete this entry?')) {
                       await deleteJournalEntry(entry.id);
                     }
                  }}
                  className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* History Review Button */}
        {!isSearchMode && (
          <button 
            onClick={() => setIsSearchMode(true)}
            className="w-full py-6 mt-4 text-sm text-stone-400 font-bold border-2 border-dashed border-stone-100 rounded-[2rem] hover:border-stone-200 transition-all uppercase tracking-widest"
          >
            查看全部往期复盘
          </button>
        )}
      </div>
    </div>
  );
}
