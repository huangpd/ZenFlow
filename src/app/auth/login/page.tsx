'use client';

import { login } from '@/actions/login';
import { useActionState } from 'react';

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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-4 border rounded-lg">
        <h1 className="text-2xl font-bold text-center">登录</h1>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">电子邮箱</label>
            <input name="email" type="email" required className="w-full p-2 border border-stone-200 rounded focus:ring-2 focus:ring-stone-500 outline-none" placeholder="请输入邮箱" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">密码</label>
            <input name="password" type="password" required className="w-full p-2 border border-stone-200 rounded focus:ring-2 focus:ring-stone-500 outline-none" placeholder="请输入密码" />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full p-2 text-white bg-stone-800 rounded hover:bg-stone-700 disabled:bg-stone-300 transition-colors"
          >
            {pending ? '正在登录...' : '登 录'}
          </button>
        </form>
        <p className="text-sm text-center text-stone-500">
          还没有账号？ <a href="/auth/register" className="text-stone-800 font-medium hover:underline">立即注册</a>
        </p>
      </div>
    </div>
  );
}