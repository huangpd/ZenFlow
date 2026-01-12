'use client';

import { useEffect } from 'react';

export function ServiceWorkerProvider() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then(registration => {
            console.log('Service Worker registered successfully:', registration);
          })
          .catch(error => {
            console.log('Service Worker registration failed:', error);
          });
      });

      // 监听来自 Service Worker 的消息
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SERVICE_WORKER_ALIVE') {
          // Service Worker 仍在运行
          console.log('Service Worker heartbeat received');
        }
      });
    }
  }, []);

  return null;
}
