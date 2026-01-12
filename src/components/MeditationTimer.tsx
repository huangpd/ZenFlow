'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Wind, Settings2 } from 'lucide-react';
import { saveMeditationSession } from '@/actions/meditation';
import CelebrationEffect from './CelebrationEffect';

export default function MeditationTimer() {
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [showEffect, setShowEffect] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const playBell = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      // 苹果闹钟音效：快速重复的高频音调
      const playAlarmTone = () => {
        const pattern = [
          { freq: 1000, duration: 0.1 },
          { freq: 0, duration: 0.1 },
          { freq: 1000, duration: 0.1 },
          { freq: 0, duration: 0.1 },
          { freq: 1200, duration: 0.15 },
          { freq: 0, duration: 0.1 },
          { freq: 1200, duration: 0.15 },
        ];
        
        let time = ctx.currentTime;
        pattern.forEach(({ freq, duration }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          
          gain.gain.setValueAtTime(freq ? 0.4 : 0, time);
          gain.gain.linearRampToValueAtTime(freq ? 0.4 : 0, time + duration * 0.9);
          gain.gain.linearRampToValueAtTime(0, time + duration);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(time);
          osc.stop(time + duration);
          
          time += duration;
        });
      };
      
      // 播放3次警报声
      playAlarmTone();
      playAlarmTone();
      playAlarmTone();
    } catch (e) {
      console.warn('Audio Context error', e);
    }
  }, []);

  const handleComplete = useCallback(async () => {
    playBell();
    setShowEffect(true);
    await saveMeditationSession(selectedDuration);
    setTimeout(() => setShowEffect(false), 1800);
  }, [playBell, selectedDuration]);

  useEffect(() => {
    // 后台保活：防止浏览器关闭标签页时杀死定时器
    let keepAliveInterval: NodeJS.Timeout | null = null;
    
    if (timerRunning) {
      // 保活机制：每10秒发送一次信号给Service Worker保持活动
      keepAliveInterval = setInterval(() => {
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'KEEP_ALIVE',
            timestamp: Date.now()
          });
        }
      }, 10000);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      handleComplete();
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (keepAliveInterval) clearInterval(keepAliveInterval);
    };
  }, [timerRunning, timeLeft, handleComplete]);

  const toggleTimer = () => setTimerRunning(!timerRunning);

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(selectedDuration * 60);
  };

  const handleDurationChange = (mins: number) => {
    if (timerRunning) return;
    setSelectedDuration(mins);
    setTimeLeft(mins * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeLeft / (selectedDuration * 60);

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-12 animate-in fade-in duration-700">
      {showEffect && <CelebrationEffect />}
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif text-stone-800 tracking-wide">静坐冥想</h2>
        <p className="text-xs text-stone-400 font-medium italic">心安神定 · 观照内外</p>
      </div>

      <div className="relative flex items-center justify-center">
        <svg className="w-64 h-64 -rotate-90" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r="68" className="stroke-stone-100 fill-none stroke-[3px]" />
          <circle 
            cx="72" 
            cy="72" 
            r="68" 
            className="stroke-emerald-800 fill-none stroke-[3px] transition-all duration-1000" 
            strokeDasharray={427.2}
            strokeDashoffset={427.2 * (1 - progress)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <div className="text-5xl font-light font-mono text-stone-800 tracking-tighter">
            {formatTime(timeLeft)}
          </div>
          {timerRunning && (
             <div className="flex items-center mt-2 space-x-1 text-emerald-600 animate-pulse opacity-60">
                <Wind size={12} />
                <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-emerald-700">静心</span>
             </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-8 w-full max-w-[280px]">
        <div className="flex justify-between w-full bg-stone-100/50 p-1 rounded-2xl">
           {[10, 25, 45, 60].map(mins => (
              <button 
                key={mins} 
                disabled={timerRunning} 
                onClick={() => handleDurationChange(mins)} 
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${selectedDuration === mins ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              >
                {mins}m
              </button>
           ))}
        </div>

        <div className="flex items-center space-x-10">
          <button 
            onClick={resetTimer} 
            className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 active:scale-90 transition-all hover:bg-stone-200"
          >
            <RotateCcw size={20} />
          </button>
          <button 
            onClick={toggleTimer} 
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 ${timerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-stone-800 hover:bg-stone-900'}`}
          >
            {timerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          <button className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 active:scale-90 transition-all hover:bg-stone-200">
            <Settings2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
