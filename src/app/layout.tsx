import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerProvider } from "@/components/ServiceWorkerProvider";
import CapacitorProvider from "@/components/CapacitorProvider";

export const metadata: Metadata = {
  title: "ZenFlow - Spiritual Companion",
  description: "Your personal AI spiritual companion for mindfulness and growth.",
};

/**
 * 应用根布局 (Root Layout)
 * 定义整个应用的 HTML 结构，加载全局样式、字体以及 ServiceWorker
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="antialiased font-sans text-stone-800 bg-stone-50">
        <CapacitorProvider>
          <ServiceWorkerProvider />
          {children}
        </CapacitorProvider>
      </body>
    </html>
  );
}