'use client';

import React, { useState } from 'react';
import { 
  ClipboardList, PenLine, Timer as TimerIcon, BarChart3, Bot
} from 'lucide-react';
import PracticeSystem from './PracticeSystem';
import JournalSection from './JournalSection';
import ChatInterface from './ChatInterface';

interface DashboardContentProps {
  initialTasks: any[];
  initialHistory: any[];
  initialJournal: any[];
}

export default function DashboardContent({ 
  initialTasks, 
  initialHistory, 
  initialJournal 
}: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState<'homework' | 'log' | 'chat' | 'timer' | 'stats'>('homework');

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 pb-24">
        {activeTab === 'homework' && <PracticeSystem initialTasks={initialTasks} />}
        {activeTab === 'log' && <JournalSection entries={initialJournal} />}
        {activeTab === 'chat' && <ChatInterface initialMessages={initialHistory} />}
        {activeTab === 'timer' && (
          <div className="flex flex-col items-center justify-center h-full text-stone-300 italic">
            <TimerIcon size={48} strokeWidth={1} className="mb-4" />
            <p>静坐模块开发中...</p>
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="flex flex-col items-center justify-center h-full text-stone-300 italic">
            <BarChart3 size={48} strokeWidth={1} className="mb-4" />
            <p>统计模块开发中...</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation (Restoring Original Feel) */}
      <nav className="fixed bottom-0 left-0 right-0 md:absolute h-20 bg-white/80 backdrop-blur-xl border-t border-stone-100 flex items-center justify-around px-4 pb-2 z-50">
        <NavItem 
          active={activeTab === 'homework'} 
          onClick={() => setActiveTab('homework')} 
          icon={<ClipboardList size={22} />} 
          label="功课" 
        />
        <NavItem 
          active={activeTab === 'log'} 
          onClick={() => setActiveTab('log')} 
          icon={<PenLine size={22} />} 
          label="随喜" 
        />
        <NavItem 
          active={activeTab === 'chat'} 
          onClick={() => setActiveTab('chat')} 
          icon={<Bot size={22} />} 
          label="问道" 
        />
        <NavItem 
          active={activeTab === 'timer'} 
          onClick={() => setActiveTab('timer')} 
          icon={<TimerIcon size={22} />} 
          label="静坐" 
        />
        <NavItem 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')} 
          icon={<BarChart3 size={22} />} 
          label="精进" 
        />
      </nav>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 w-14 ${active ? 'text-emerald-800' : 'text-stone-300'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${active ? 'bg-emerald-50' : ''}`}>{icon}</div>
      <span className={`text-[10px] font-bold tracking-widest ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
    </button>
  );
}
