'use client';

import React, { useState } from 'react';
import {
  ClipboardList, PenLine, Timer as TimerIcon, BarChart3, Bot
} from 'lucide-react';
import PracticeSystem from './PracticeSystem';
import JournalSection from './JournalSection';
import ChatInterface from './ChatInterface';
import MeditationTimer from './MeditationTimer';
import PracticeStats from './PracticeStats';

interface DashboardContentProps {
  initialTasks: any[];
  initialHistory: any[];
  initialJournal: any[];
  userName: string;
}

export default function DashboardContent({
  initialTasks,
  initialHistory,
  initialJournal,
  userName
}: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState<'homework' | 'log' | 'chat' | 'timer' | 'stats'>('homework');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 pb-32">
        {activeTab === 'homework' && <PracticeSystem initialTasks={initialTasks} onTaskUpdate={handleTaskUpdate} />}
        {activeTab === 'log' && <JournalSection entries={initialJournal} />}
        {activeTab === 'chat' && <ChatInterface initialMessages={initialHistory} />}
        {activeTab === 'timer' && <MeditationTimer />}
        {activeTab === 'stats' && <PracticeStats userName={userName} refreshTrigger={refreshTrigger} />}
      </div>

      {/* Modern Floating Glass Dock */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-6 z-50 pointer-events-none">
        <nav className="pointer-events-auto h-16 px-4 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-white/20 dark:border-stone-800/50 rounded-full flex items-center justify-around gap-1 shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-w-md w-full">
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
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center flex-1 h-12 rounded-full transition-all duration-500 overflow-hidden ${active ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'}`}
    >
      {active && (
        <span className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 animate-in fade-in zoom-in duration-300 rounded-full" />
      )}
      <div className={`relative transition-transform duration-300 ${active ? 'scale-110 -translate-y-1' : ''}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-medium tracking-wider transition-all duration-300 ${active ? 'opacity-100 mt-0.5' : 'opacity-0 h-0 overflow-hidden'}`}>
        {label}
      </span>
    </button>
  );
}
