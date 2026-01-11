'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ModelMetadata } from '@/lib/schema-metadata';
import { Menu, X, Database } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  models: ModelMetadata[];
}

export default function AdminSidebar({ models }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden p-4 bg-white border-b flex justify-between items-center">
        <span className="font-bold">Menu</span>
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 pt-16 md:pt-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-slate-700 hidden md:block">
           <Link href="/admin" className="text-xl font-bold flex items-center gap-2">
             <Database className="w-6 h-6" />
             Data Admin
           </Link>
        </div>
        <nav className="p-4 space-y-2 h-full overflow-y-auto">
          {models.map(model => (
            <Link 
              key={model.name} 
              href={`/admin/data/${model.name}`}
              className={cn(
                "block p-2 rounded hover:bg-slate-800 transition-colors",
                pathname === `/admin/data/${model.name}` ? "bg-slate-800 text-blue-400" : ""
              )}
              onClick={() => setIsOpen(false)}
            >
              {model.name}
            </Link>
          ))}
        </nav>
      </aside>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
