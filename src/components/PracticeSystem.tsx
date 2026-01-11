'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import SutraReader from './SutraReader';
import AddTaskModal from './AddTaskModal';
import CelebrationEffect from './CelebrationEffect';

export default function PracticeSystem({ initialTasks }: { initialTasks: any[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [readingTask, setReadingTask] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  if (readingTask) {
    return (
      <div className="h-full">
        {showCelebration && <CelebrationEffect />}
        <SutraReader 
          task={readingTask} 
          onBack={() => setReadingTask(null)} 
          onComplete={triggerCelebration}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 h-full">
      {showCelebration && <CelebrationEffect />}
      
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-stone-800">每日功课</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="p-2 bg-stone-100 rounded-full active:bg-stone-200 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-stone-400 border-2 border-dashed rounded-[2rem]">
            暂无功课，点击右上方按钮请领
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onRead={setReadingTask} 
              onComplete={triggerCelebration}
            />
          ))
        )}
      </div>

      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onTaskCreated={(newTask) => setTasks([...tasks, newTask])}
      />
    </div>
  );
}
