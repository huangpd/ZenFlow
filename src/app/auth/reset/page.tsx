'use client';

import { reset } from '@/actions/reset';
import { useActionState } from 'react';
import TurnstileWidget from '@/components/auth/TurnstileWidget';

const initialState: { error?: string; success?: string } = {};

export default function ResetPage() {
    const [state, formAction, pending] = useActionState(reset, initialState);

    return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
              <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-serif font-medium text-stone-800 tracking-wide">重置密码</h1>
                  <p className="text-stone-500 text-sm">
                    请输入您的注册邮箱，我们将发送重置链接给您
                  </p>
                </div>
        
                <form action={formAction} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1.5 ml-1">电子邮箱</label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-stone-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-200 outline-none transition-all placeholder:text-stone-400"
                      placeholder="name@example.com"
                    />
                  </div>
        
                  <TurnstileWidget />
        
                  {state?.error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg flex items-center justify-center">
                      {state.error}
                    </div>
                  )}
                  {state?.success && (
                    <div className="p-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg flex items-center justify-center">
                      {state.success}
                    </div>
                  )}
        
                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full py-3.5 text-white bg-stone-800 rounded-xl hover:bg-stone-700 active:scale-[0.98] disabled:opacity-70 disabled:scale-100 transition-all font-medium shadow-lg shadow-stone-800/10"
                  >
                    {pending ? '正在发送...' : '发送重置邮件'}
                  </button>
                </form>
        
                <div className="pt-2 text-center">
                  <p className="text-sm text-stone-500">
                    <a href="/auth/login" className="text-stone-800 font-medium hover:underline decoration-stone-300 underline-offset-4">返回登录</a>
                  </p>
                </div>
              </div>
            </div>    );
}
