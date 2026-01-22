'use client';

import React, { useState } from 'react';
import { Plus, BookMarked } from 'lucide-react';
import Link from 'next/link';
import TaskCard from './TaskCard';
import SutraReader from './SutraReader';
import AddTaskModal from './AddTaskModal';
import CelebrationEffect from './CelebrationEffect';

export default function PracticeSystem({ initialTasks, onTaskUpdate }: { initialTasks: any[], onTaskUpdate?: () => void }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [readingTask, setReadingTask] = useState<any | null>(null);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1800);
  };

  const handleTaskProgress = (taskId: string, newCurrent: number, completed: boolean) => {
    setTasks(prevTasks => prevTasks.map(t =>
      t.id === taskId ? { ...t, current: newCurrent, completed } : t
    ));
    // Notify parent to refresh stats
    onTaskUpdate?.();
  };

  const handleTaskUpdate = (updatedTask: any) => {
    setTasks(prevTasks => prevTasks.map(t =>
      t.id === updatedTask.id ? { ...t, ...updatedTask } : t
    ));
    // Synchronize editingTask if it's currently being edited
    if (editingTask && editingTask.id === updatedTask.id) {
      setEditingTask((prev: any) => ({ ...prev, ...updatedTask }));
    }
    // Notify parent to refresh stats (e.g. if target changed)
    onTaskUpdate?.();
  };

  if (readingTask) {
    return (
      <div className="min-h-screen bg-white">
        {showCelebration && <CelebrationEffect />}
        <SutraReader
          task={readingTask}
          onBack={() => setReadingTask(null)}
          onComplete={triggerCelebration}
          onProgress={(id, curr, comp) => handleTaskProgress(id, curr, comp)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 h-full">
      {showCelebration && <CelebrationEffect />}

      <div className="flex justify-between items-center px-4">
        <h2 className="text-2xl font-serif text-stone-800 tracking-wide">每日功课</h2>
        <div className="flex gap-2">
          <Link
            href="/dashboard/my-sutras"
            className="p-3 bg-stone-100 rounded-full hover:bg-emerald-50 transition-all active:scale-90 shadow-sm group"
            title="我的佛经库"
          >
            <BookMarked size={20} className="text-stone-600 group-hover:text-emerald-600 transition-colors" />
          </Link>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-3 bg-stone-100 rounded-full active:bg-stone-200 transition-all active:scale-90 shadow-sm"
          >
            <Plus size={24} className="text-stone-600" />
          </button>
        </div>
      </div>

      <div className="space-y-4 px-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-stone-400 border border-dashed rounded-[2rem] border-stone-100">
            暂无功课，点击右上方按钮请领
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onRead={setReadingTask}
              onEdit={setEditingTask}
              onComplete={triggerCelebration}
              onProgress={handleTaskProgress}
            />
          ))
        )}
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen || !!editingTask}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTask(null);
        }}
        onTaskCreated={(newTask) => {
          setTasks(prev => {
            const exists = prev.find(t => t.id === newTask.id);
            if (exists) {
              return prev.map(t => t.id === newTask.id ? newTask : t);
            }
            return [...prev, newTask];
          });
          onTaskUpdate?.();
        }}
        onTaskUpdated={handleTaskUpdate}
        taskToEdit={editingTask}
      />
    </div>
  );
}