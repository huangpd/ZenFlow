'use client';

import { useActionState, useState, useEffect } from 'react';
import { createJournalEntry, deleteJournalEntry } from '@/actions/journal';
import { Loader2, Trash2, PenLine } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CelebrationEffect from './CelebrationEffect';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const moods = ['peaceful', 'happy', 'neutral', 'anxious', 'sad'];

export default function JournalSection({ entries }: { entries: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [state, formAction, pending] = useActionState(createJournalEntry, null);

  useEffect(() => {
    if (state?.success) {
      setIsExpanded(false);
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      {showCelebration && <CelebrationEffect />}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-stone-800 flex items-center gap-2">
          <PenLine className="w-5 h-5" />
          修行日记
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-stone-500 hover:text-stone-800 underline"
        >
          {isExpanded ? 'Cancel' : 'Write New'}
        </button>
      </div>

      {isExpanded && (
        <form action={formAction} className="bg-white p-6 rounded-xl border space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">此刻的心境</label>
            <div className="flex gap-2">
              {moods.map((m) => (
                <label key={m} className="cursor-pointer">
                  <input type="radio" name="mood" value={m} className="peer sr-only" />
                  <div className="px-3 py-1 rounded-full border text-xs peer-checked:bg-stone-800 peer-checked:text-white hover:bg-stone-100 transition-colors">
                    {m}
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <textarea
              name="content"
              rows={4}
              placeholder="记录当下的感悟..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200 resize-none"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            {state?.error && <p className="text-sm text-red-600 self-center mr-auto">{state.error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm hover:bg-stone-700 disabled:opacity-50 flex items-center gap-2"
            >
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Entry
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-stone-400 border-2 border-dashed rounded-xl">
            暂无日记
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-white p-5 rounded-xl border hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-stone-400">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
                {entry.mood && (
                  <span className="px-2 py-0.5 bg-stone-100 rounded-full text-xs text-stone-600">
                    {entry.mood}
                  </span>
                )}
              </div>
              <p className="text-stone-700 whitespace-pre-wrap">{entry.content}</p>
              
              <button
                onClick={async () => {
                   if(confirm('Delete this entry?')) {
                     await deleteJournalEntry(entry.id);
                   }
                }}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity"
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
