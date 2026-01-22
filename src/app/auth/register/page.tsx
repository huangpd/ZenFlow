'use client';

import { register } from '@/actions/register';
import { useActionState } from 'react';
import TurnstileWidget from '@/components/auth/TurnstileWidget';

const initialState = {
  error: '',
  success: '',
};

/**
 * 用户注册页面
 * 处理新用户注册逻辑，收集姓名、邮箱和密码创建新账号
 */
export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-serif font-medium text-stone-800 tracking-wide">开启旅程</h1>
          <p className="text-stone-500 text-sm">创建您的 ZenFlow 账号</p>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5 ml-1">姓名</label>
              <input 
                name="name" 
                type="text" 
                className="w-full px-4 py-3 bg-stone-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-200 outline-none transition-all placeholder:text-stone-400" 
                placeholder="您希望我们怎么称呼您" 
              />
            </div>
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
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5 ml-1">密码</label>
              <input 
                name="password" 
                type="password" 
                required 
                className="w-full px-4 py-3 bg-stone-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-200 outline-none transition-all placeholder:text-stone-400" 
                placeholder="设置登录密码" 
              />
            </div>
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
            {pending ? '注册中...' : '立即注册'}
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-sm text-stone-500">
            已经有账号了？ <a href="/auth/login" className="text-stone-800 font-medium hover:underline decoration-stone-300 underline-offset-4">直接登录</a>
          </p>
        </div>
      </div>
    </div>
  );
}