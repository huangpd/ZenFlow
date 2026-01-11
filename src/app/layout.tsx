import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZenFlow - Spiritual Companion",
  description: "Your personal AI spiritual companion for mindfulness and growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-stone-800 bg-stone-50">
        {children}
      </body>
    </html>
  );
}