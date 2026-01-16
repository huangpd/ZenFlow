'use client';

import { reset } from '@/actions/reset';
import { useActionState } from 'react';

const initialState: { error?: string; success?: string } = {};

export default function ResetPage() {
    const [state, formAction, pending] = useActionState(reset, initialState);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-4 border rounded-lg shadow-sm bg-white">
                <h1 className="text-2xl font-bold text-center">重置密码</h1>
                <p className="text-sm text-center text-stone-500">
                    请输入您的注册邮箱，我们将发送重置链接给您。
                </p>
                <form action={formAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700">电子邮箱</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full p-2 border border-stone-200 rounded focus:ring-2 focus:ring-stone-500 outline-none"
                            placeholder="请输入邮箱"
                        />
                    </div>
                    {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
                    {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full p-2 text-white bg-stone-800 rounded hover:bg-stone-700 disabled:bg-stone-300 transition-colors"
                    >
                        {pending ? '正在发送...' : '发送重置邮件'}
                    </button>
                </form>
                <p className="text-sm text-center text-stone-500">
                    <a href="/auth/login" className="text-stone-800 font-medium hover:underline">返回登录</a>
                </p>
            </div>
        </div>
    );
}
