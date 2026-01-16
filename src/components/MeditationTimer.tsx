'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Wind, Settings2 } from 'lucide-react';
import { saveMeditationSession } from '@/actions/meditation';
import CelebrationEffect from './CelebrationEffect';
import { Capacitor } from '@capacitor/core';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';

export default function MeditationTimer() {
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  // timeLeft 仅用于 UI 显示，逻辑核心由 endTimeRef 控制
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [showEffect, setShowEffect] = useState(false);
  
  // 使用 Ref 存储核心计时状态，避免闭包陷阱和重渲染
  const endTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化权限
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.requestPermissions();
    }
  }, []);

  const playBell = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
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
      
      playAlarmTone();
      setTimeout(playAlarmTone, 1000);
      setTimeout(playAlarmTone, 2000);
    } catch (e) {
      console.warn('Audio Context error', e);
    }
  }, []);

  const stopTimerLogic = useCallback(async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerRunning(false);
    
    if (Capacitor.isNativePlatform()) {
      try {
        await KeepAwake.allowSleep();
        await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
      } catch (e) {
        console.error('Failed to clear native resources', e);
      }
    }
  }, []);

  const handleComplete = useCallback(async () => {
    await stopTimerLogic();
    setTimeLeft(0);
    playBell();
    setShowEffect(true);
    await saveMeditationSession(selectedDuration);
    setTimeout(() => setShowEffect(false), 1800);
  }, [playBell, selectedDuration, stopTimerLogic]);

  // 启动计时器
  const startTimer = async () => {
    if (timeLeft <= 0) return;

    // 计算结束时间戳
    const now = Date.now();
    const durationMs = timeLeft * 1000;
    const endTime = now + durationMs;
    endTimeRef.current = endTime;

    setTimerRunning(true);

    if (Capacitor.isNativePlatform()) {
      try {
        await KeepAwake.keepAwake();
        // 调度本地通知
        await LocalNotifications.schedule({
          notifications: [{
            title: "冥想结束",
            body: "愿你安住当下，清明前行。",
            id: 1001,
            schedule: { at: new Date(endTime) },
            sound: "default", // 注意：自定义铃声需要原生资源配置，这里暂用默认
            smallIcon: "ic_stat_icon_config_sample", // Android 默认图标名，可能需要调整
            actionTypeId: "",
            extra: null
          }]
        });
      } catch (e) {
        console.error('Native plugin error', e);
      }
    }

    // 启动视觉更新循环
    timerIntervalRef.current = setInterval(() => {
      const remainingMs = endTimeRef.current! - Date.now();
      if (remainingMs <= 0) {
        handleComplete();
      } else {
        setTimeLeft(Math.ceil(remainingMs / 1000));
      }
    }, 200); // 提高刷新率以平滑显示，虽然 UI 只显示秒
  };

  const pauseTimer = async () => {
    await stopTimerLogic();
    // timeLeft 已经在 state 中，下次 start 会基于它计算新的 endTime
  };

  const toggleTimer = () => {
    if (timerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const resetTimer = async () => {
    await stopTimerLogic();
    setTimeLeft(selectedDuration * 60);
    endTimeRef.current = null;
  };

  const handleDurationChange = (mins: number) => {
    if (timerRunning) return;
    setSelectedDuration(mins);
    setTimeLeft(mins * 60);
  };

  // 监听 App 状态恢复 (Resume)，校准时间
  useEffect(() => {
    let resumeListener: any;
    
    if (Capacitor.isNativePlatform()) {
      resumeListener = App.addListener('appStateChange', ({ isActive }) => {
        if (isActive && timerRunning && endTimeRef.current) {
          const remainingMs = endTimeRef.current - Date.now();
          if (remainingMs <= 0) {
            handleComplete();
          } else {
            setTimeLeft(Math.ceil(remainingMs / 1000));
          }
        }
      });
    }

    return () => {
      if (resumeListener) resumeListener.remove();
    };
  }, [timerRunning, handleComplete]);

  // 组件卸载清理
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (Capacitor.isNativePlatform()) {
        KeepAwake.allowSleep().catch(() => {});
      }
    };
  }, []);

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
            {formatTime(Math.max(0, timeLeft))}
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
           {[3, 10, 25, 45, 60].map(mins => (
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
