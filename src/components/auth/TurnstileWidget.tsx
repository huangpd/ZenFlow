'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile: any;
  }
}

export default function TurnstileWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState('');
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    // 动态加载 Cloudflare Turnstile 脚本
    if (!document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const initTurnstile = () => {
      if (window.turnstile && containerRef.current && !widgetId.current) {
        const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
        
        if (!siteKey) {
          console.error('Turnstile Site Key is missing');
          return;
        }

        try {
          // 清除可能存在的旧内容
          containerRef.current.innerHTML = '';
          
          widgetId.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: 'light',
            callback: (token: string) => {
              setToken(token);
            },
            'expired-callback': () => {
              setToken('');
            },
          });
        } catch (error) {
          console.error('Error rendering Turnstile:', error);
        }
      }
    };

    // 检查脚本是否加载完成，或者等待加载
    if (window.turnstile) {
      initTurnstile();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          initTurnstile();
        }
      }, 100);
      
      return () => clearInterval(interval);
    }

    return () => {
        // 组件卸载时可以考虑重置，但在 React StrictMode 下可能会导致二次渲染问题，
        // 这里主要依赖 widgetId ref 来防止重复渲染
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="my-4 flex justify-center min-h-[65px]" />
      <input type="hidden" name="cf-turnstile-response" value={token} />
    </>
  );
}