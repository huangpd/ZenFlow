'use client';

import { register } from '@/actions/register';
import { useActionState } from 'react';

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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-4 border rounded-lg">
        <h1 className="text-2xl font-bold text-center">注册</h1>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">姓名</label>
            <input name="name" type="text" className="w-full p-2 border border-stone-200 rounded focus:ring-2 focus:ring-stone-500 outline-none" placeholder="您的姓名" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">电子邮箱</label>
            <input name="email" type="email" required className="w-full p-2 border border-stone-200 rounded focus:ring-2 focus:ring-stone-500 outline-none" placeholder="请输入邮箱" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">密码</label>
            <input name="password" type="password" required className="w-full p-2 border border-stone-200 rounded focus:ring-2 focus:ring-stone-500 outline-none" placeholder="请设置密码" />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full p-2 text-white bg-stone-800 rounded hover:bg-stone-700 disabled:bg-stone-300 transition-colors"
          >
            {pending ? '正在注册...' : '注 册'}
          </button>
        </form>
        <p className="text-sm text-center text-stone-500">
          已经有账号了？ <a href="/auth/login" className="text-stone-800 font-medium hover:underline">直接登录</a>
        </p>
      </div>
    </div>
  );
}