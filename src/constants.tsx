import React from 'react';
import { Quote, HandHelping, Users, Leaf, BookOpen, Flame, Hash } from 'lucide-react';

// Map for rendering icons based on string IDs
export const ICON_MAP: Record<string, React.ReactNode> = {
  'flame': <Flame className="text-orange-500" size={18}/>,
  'hash': <Hash className="text-amber-600" size={18}/>,
  'book': <BookOpen className="text-blue-600" size={18}/>,
};

export const CATEGORIES = [
  { label: '感悟', icon: <Quote size={16}/>, color: 'bg-stone-100 text-stone-600', border: 'border-stone-200' },
  { label: '布施', icon: <HandHelping size={16}/>, color: 'bg-rose-50 text-rose-700', border: 'border-rose-200' },
  { label: '供僧', icon: <Users size={16}/>, color: 'bg-amber-50 text-amber-700', border: 'border-amber-200' },
  { label: '放生', icon: <Leaf size={16}/>, color: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200' },
  { label: '法施', icon: <BookOpen size={16}/>, color: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
];

// No more hardcoded presets or sutra content. 
// Everything is now managed via the database and Admin Panel.