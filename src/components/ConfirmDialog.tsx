import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  defaultValue?: string; // If provided, renders an input
  inputType?: 'text' | 'number';
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  defaultValue,
  inputType = 'text',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = useState(defaultValue || '');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue || '');
    }
  }, [isOpen, defaultValue]);

  if (!isOpen || !mounted) return null;

  const handleConfirm = () => {
    onConfirm(defaultValue !== undefined ? inputValue : undefined);
  };

  return createPortal(
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-stone-100">
        <h3 className="text-xl font-serif text-stone-800 tracking-wide mb-3 text-center">{title}</h3>
        <p className="text-sm text-stone-500 mb-6 text-center whitespace-pre-wrap leading-relaxed">{message}</p>
        
        {defaultValue !== undefined && (
          <div className="mb-6">
            <input
              type={inputType}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl text-center text-xl font-serif text-emerald-700 focus:ring-2 focus:ring-stone-200 transition-all outline-none"
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-200 transition-colors shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
