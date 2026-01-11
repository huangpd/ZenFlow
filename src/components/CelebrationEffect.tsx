'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function CelebrationEffect() {
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden bg-white/10 backdrop-blur-[1px] animate-in fade-in duration-500">
      <div className="animate-ping absolute">
        <Sparkles className="text-amber-400 w-48 h-48 opacity-40" />
      </div>
      <div className="flex flex-col items-center animate-bounce">
        <div className="text-7xl drop-shadow-lg">🪷</div>
        <div className="bg-white/95 px-8 py-3 rounded-full shadow-2xl mt-6 border border-amber-200">
          <span className="text-amber-900 font-bold tracking-[0.2em] text-lg">功德圆满</span>
        </div>
      </div>
      {[...Array(8)].map((_, i) => (
        <div 
          key={i}
          className="absolute text-3xl animate-pulse"
          style={{
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
            animationDelay: `${i * 0.4}s`,
            opacity: 0.5
          }}
        >🪷</div>
      ))}
    </div>
  );
}
