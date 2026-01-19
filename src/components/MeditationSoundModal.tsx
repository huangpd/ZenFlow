import React from 'react';
import { X, Check, Volume2, Music2 } from 'lucide-react';
import { MEDITATION_SOUNDS } from '@/constants';

interface MeditationSoundModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSoundId: string;
    onSelectSound: (id: string) => void;
}

export default function MeditationSoundModal({
    isOpen,
    onClose,
    selectedSoundId,
    onSelectSound
}: MeditationSoundModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[120] flex items-end justify-center">
            <div className="bg-white w-full max-w-md rounded-t-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                            <Music2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-serif text-stone-800 tracking-wide">助修雅音</h3>
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest">选择背景白噪音</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-3">
                    {MEDITATION_SOUNDS.map((sound) => {
                        const isSelected = selectedSoundId === sound.id;
                        return (
                            <button
                                key={sound.id}
                                onClick={() => onSelectSound(sound.id)}
                                className={`w-full flex items-center p-4 rounded-2xl border transition-all duration-300 ${isSelected
                                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                        : 'bg-white border-stone-100 hover:bg-stone-50 hover:border-stone-200'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-colors ${isSelected ? 'bg-white text-emerald-600' : 'bg-stone-50 text-stone-400'
                                    }`}>
                                    {sound.id === 'none' ? <Volume2 size={18} className="opacity-50" /> : <Music2 size={18} />}
                                </div>

                                <div className="flex-1 text-left">
                                    <span className={`block font-medium ${isSelected ? 'text-emerald-800' : 'text-stone-700'}`}>
                                        {sound.name}
                                    </span>
                                    <span className={`text-xs ${isSelected ? 'text-emerald-600/70' : 'text-stone-400'}`}>
                                        {sound.description}
                                    </span>
                                </div>

                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-200 text-transparent'
                                    }`}>
                                    <Check size={12} />
                                </div>
                            </button>
                        );
                    })}
                </div>

                <p className="text-center text-xs text-stone-300 mt-8 italic">
                    注：切换即时生效，可随时调整
                </p>
            </div>
        </div>
    );
}
