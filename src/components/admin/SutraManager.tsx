'use client';

import React, { useState } from 'react';
import { Plus, Edit3, Trash2, ChevronLeft, Save, X, Loader2 } from 'lucide-react';
import { createSutra, updateSutra, deleteSutra } from '@/actions/admin';
import Link from 'next/link';

export default function SutraManager({ initialSutras }: { initialSutras: any[] }) {
  const [sutras, setSutras] = useState(initialSutras);
  const [editingSutra, setEditingSutra] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    content: '',
    type: 'sutra',
    iconId: 'book',
    defaultStep: 1
  });
  const [loading, setLoading] = useState(false);

  const openAdd = () => {
    setEditingSutra(null);
    setFormData({ 
      title: '', 
      description: '', 
      content: '', 
      type: 'sutra', 
      iconId: 'book', 
      defaultStep: 1 
    });
    setIsModalOpen(true);
  };

  const openEdit = (sutra: any) => {
    setEditingSutra(sutra);
    setFormData({ 
      title: sutra.title, 
      description: sutra.description || '', 
      content: sutra.content || '',
      type: sutra.type || 'sutra',
      iconId: sutra.iconId || 'book',
      defaultStep: sutra.defaultStep || 1
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let result;
    if (editingSutra) {
      result = await updateSutra(editingSutra.id, formData);
    } else {
      result = await createSutra(formData);
    }

    setLoading(false);

    if (result.success) {
      setIsModalOpen(false);
      window.location.reload(); 
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个模板吗？这将影响所有已请领的相应功课。')) {
      await deleteSutra(id);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 bg-white rounded-full text-stone-400 hover:text-stone-800 transition-colors shadow-sm">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold text-stone-800">功课库管理</h1>
          </div>
          <button onClick={openAdd} className="px-6 py-3 bg-stone-800 text-white rounded-2xl font-bold shadow-lg active:scale-95 flex items-center gap-2 hover:bg-stone-900 transition-all">
            <Plus size={20} /> 新增功课模板
          </button>
        </div>

        <div className="grid gap-4">
          {sutras.map(sutra => (
            <div key={sutra.id} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-md transition-all group flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest bg-stone-100 px-2 py-0.5 rounded text-stone-500">{sutra.type}</span>
                  <h3 className="text-xl font-bold text-stone-800">{sutra.title}</h3>
                </div>
                <p className="text-stone-400 text-sm line-clamp-1 max-w-lg">{sutra.description || '暂无简介'}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(sutra)} className="p-3 bg-stone-50 text-stone-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => handleDelete(sutra.id)} className="p-3 bg-stone-50 text-stone-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="text-xl font-bold text-stone-800">{editingSutra ? '编辑模板' : '新增模板'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 tracking-widest uppercase ml-1">功课名称</label>
                  <input 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-stone-800 transition-all font-bold text-stone-800"
                    placeholder="如：金刚经 或 大悲咒"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 tracking-widest uppercase ml-1">任务类型</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-stone-800 transition-all text-stone-800 font-bold"
                  >
                    <option value="sutra">诵经 (Sutra)</option>
                    <option value="counter">计数 (Counter)</option>
                    <option value="normal">普通打卡 (Normal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 tracking-widest uppercase ml-1">图标 ID</label>
                  <select 
                    value={formData.iconId}
                    onChange={e => setFormData({...formData, iconId: e.target.value})}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-stone-800 transition-all text-stone-800"
                  >
                    <option value="book">Book (经文)</option>
                    <option value="hash">Hash (计数)</option>
                    <option value="flame">Flame (仪式)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 tracking-widest uppercase ml-1">默认步长</label>
                  <input 
                    type="number"
                    value={formData.defaultStep} 
                    onChange={e => setFormData({...formData, defaultStep: parseInt(e.target.value) || 1})}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-stone-800 transition-all text-stone-800 font-mono font-bold"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 tracking-widest uppercase ml-1">简介</label>
                <input 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-stone-800 transition-all text-stone-600"
                  placeholder="简要描述..."
                />
              </div>

              {formData.type === 'sutra' && (
                <div className="space-y-2 h-full flex-1">
                  <label className="text-xs font-bold text-stone-400 tracking-widest uppercase ml-1">经文全文</label>
                  <textarea 
                    required 
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full h-64 p-5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-stone-800 transition-all text-lg leading-relaxed font-serif resize-none"
                    placeholder="请输入经文内容..."
                  />
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-4 bg-stone-800 text-white rounded-2xl font-bold shadow-lg hover:bg-stone-900 active:scale-95 transition-all flex items-center gap-2"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  保存功课模板
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
