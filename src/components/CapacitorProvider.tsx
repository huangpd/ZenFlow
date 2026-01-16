'use client';

import { StatusBar, Style } from '@capacitor/status-bar';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export default function CapacitorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // 全面屏适配：状态栏透明，内容延伸到顶部
      const initStatusBar = async () => {
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          // 在 Android 上，overlay 使得内容延伸到状态栏下方
          await StatusBar.setOverlaysWebView({ overlay: true });
        } catch (e) {
          console.error('StatusBar setup failed', e);
        }
      };
      
      initStatusBar();
    }
  }, []);

  return <>{children}</>;
}
