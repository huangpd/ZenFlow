'use client';

import { login } from '@/actions/login';
import { useActionState } from 'react';
import TurnstileWidget from '@/components/auth/TurnstileWidget';

const initialState = {
  error: '',
};

/**
 * 用户登录页面
 * 处理用户登录逻辑，收集邮箱和密码，通过 Server Action 进行验证
 */
export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-serif font-medium text-stone-800 tracking-wide">欢迎归来</h1>
          <p className="text-stone-500 text-sm">继续您的灵性探索之旅</p>
        </div>
        
        <form action={formAction} className="space-y-5">
          <div className="space-y-4">
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
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-xs font-medium text-stone-500">密码</label>
                <a href="/auth/reset" className="text-xs text-stone-500 hover:text-stone-800 transition-colors">忘记密码？</a>
              </div>
              <input 
                name="password" 
                type="password" 
                required 
                className="w-full px-4 py-3 bg-stone-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-200 focus:border-stone-200 outline-none transition-all placeholder:text-stone-400" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <TurnstileWidget />
          
          {state?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg flex items-center justify-center">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 text-white bg-stone-800 rounded-xl hover:bg-stone-700 active:scale-[0.98] disabled:opacity-70 disabled:scale-100 transition-all font-medium shadow-lg shadow-stone-800/10"
          >
            {pending ? '登录中...' : '登 录'}
          </button>
        </form>
        
        <div className="pt-2 text-center">
          <p className="text-sm text-stone-500">
            还没有账号？ <a href="/auth/register" className="text-stone-800 font-medium hover:underline decoration-stone-300 underline-offset-4">立即注册</a>
          </p>
        </div>
      </div>
    </div>
  );
}