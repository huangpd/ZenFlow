'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * 妙法莲华特效 - 花开见佛
 * 庄严的莲花对称绽放动画
 */

// 精细化莲花瓣组件
const LotusPetal = ({ color, opacity }: { color: string; opacity: number }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.4))' }}>
    <path 
      d="M50 0 C75 35 75 75 50 100 C25 75 25 35 50 0" 
      fill={color} 
      fillOpacity={opacity}
    />
    <path 
      d="M50 15 C62 45 62 65 50 85 C38 65 38 45 50 15" 
      fill="white" 
      fillOpacity="0.15" 
    />
  </svg>
);

const DIVINE_COLORS = ['#FFD700', '#FFA500', '#FF4500', '#F0E68C', '#FFFFFF'];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotateSpeed: number;
  opacity: number;
  life: number;
  decay: number;
  color: string;
  gravity: number;
}

export default function CelebrationEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number | null>(null);
  const screenRef = useRef({ width: 0, height: 0 });
  const hasTriggeredRef = useRef(false);

  // 绽放函数：按照几何对称生成完美的莲花阵列
  const createFlowerBurst = (x: number, y: number) => {
    const burstColor = DIVINE_COLORS[Math.floor(Math.random() * DIVINE_COLORS.length)];
    
    // 定义两层花瓣，模拟一朵完整的莲花盛开
    const layers = [
      { count: 8, force: 2.0, size: 40, offset: 0 },   // 内层花瓣
      { count: 12, force: 4.0, size: 30, offset: 0.1 } // 外层花瓣
    ];
    
    const newParticles: any[] = [];

    layers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        // 计算精确的对称角度
        const angle = (i / layer.count) * Math.PI * 2 + layer.offset;
        const speed = layer.force;
        
        newParticles.push({
          id: Math.random(),
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: layer.size,
          rotation: (angle * 180) / Math.PI + 90, 
          rotateSpeed: (Math.random() - 0.5) * 1.5,
          opacity: 1,
          life: 1.0,
          decay: 0.004 + Math.random() * 0.002,
          color: burstColor,
          gravity: 0.012
        });
      }
    });

    setParticles(prev => [...prev, ...newParticles].slice(-400));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        screenRef.current = { width: window.innerWidth, height: window.innerHeight };
      };
      handleResize();
      window.addEventListener('resize', handleResize);

      // 触发一次中心绽放
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        const centerX = screenRef.current.width / 2;
        const centerY = screenRef.current.height / 2;
        createFlowerBurst(centerX, centerY);
      }

      const animate = () => {
        setParticles(prev => 
          prev
            .map(p => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vx: p.vx * 0.98,
              vy: p.vy * 0.98 + p.gravity,
              rotation: p.rotation + p.rotateSpeed,
              life: p.life - p.decay,
              opacity: p.life
            }))
            .filter(p => p.life > 0)
        );
        requestRef.current = requestAnimationFrame(animate);
      };

      requestRef.current = requestAnimationFrame(animate);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (requestRef.current !== null) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden animate-in fade-in duration-300">
      {/* 粒子渲染层 */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute pointer-events-none"
          style={{
            width: p.size,
            height: p.size * 1.6,
            left: 0,
            top: 0,
            transform: `translate3d(${p.x - p.size/2}px, ${p.y - p.size/2}px, 0) rotate(${p.rotation}deg)`,
            opacity: p.opacity,
            willChange: 'transform, opacity'
          }}
        >
          <LotusPetal color={p.color} opacity={p.opacity} />
        </div>
      ))}
    </div>
  );
}
