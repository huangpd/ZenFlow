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

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 pb-24">
        {activeTab === 'homework' && <PracticeSystem initialTasks={initialTasks} />}
        {activeTab === 'log' && <JournalSection entries={initialJournal} />}
        {activeTab === 'chat' && <ChatInterface initialMessages={initialHistory} />}
        {activeTab === 'timer' && <MeditationTimer />}
        {activeTab === 'stats' && <PracticeStats userName={userName} />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:absolute h-20 bg-white/95 backdrop-blur-xl border-t border-stone-100 flex items-center justify-around px-4 pb-2 z-50">
        <NavItem 
          active={activeTab === 'homework'} 
          onClick={() => setActiveTab('homework')} 
          icon={<ClipboardList size={24} strokeWidth={activeTab === 'homework' ? 2.5 : 2} />} 
          label="功课" 
        />
        <NavItem 
          active={activeTab === 'log'} 
          onClick={() => setActiveTab('log')} 
          icon={<PenLine size={24} strokeWidth={activeTab === 'log' ? 2.5 : 2} />} 
          label="随喜" 
        />
        <NavItem 
          active={activeTab === 'chat'} 
          onClick={() => setActiveTab('chat')} 
          icon={<Bot size={24} strokeWidth={activeTab === 'chat' ? 2.5 : 2} />} 
          label="问道" 
        />
        <NavItem 
          active={activeTab === 'timer'} 
          onClick={() => setActiveTab('timer')} 
          icon={<TimerIcon size={24} strokeWidth={activeTab === 'timer' ? 2.5 : 2} />} 
          label="静坐" 
        />
        <NavItem 
          active={activeTab === 'stats'} 
          onClick={() => setActiveTab('stats')} 
          icon={<BarChart3 size={24} strokeWidth={activeTab === 'stats' ? 2.5 : 2} />} 
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
      className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 w-14 ${active ? 'text-blue-600 scale-105' : 'text-stone-800 hover:text-stone-600'}`}
    >
      <div className={`p-1 rounded-xl transition-all`}>{icon}</div>
      <span className={`text-[10px] font-bold tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </button>
  );
}
