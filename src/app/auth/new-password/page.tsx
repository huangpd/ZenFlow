'use client';

import { newPassword } from '@/actions/new-password';
import { useSearchParams } from 'next/navigation';
import { useActionState, useEffect } from 'react';

const initialState: { error?: string; success?: string } = {};

function NewPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [state, formAction, pending] = useActionState(newPassword, initialState);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-4 border rounded-lg shadow-sm bg-white">
                <h1 className="text-2xl font-bold text-center">设置新密码</h1>
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="token" value={token || ''} />
                    <div>
                        <label className="block text-sm font-medium text-stone-700">新密码</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full p-2 border border-stone-200 rounded focus:ring-2 focus:ring-stone-500 outline-none"
                            placeholder="请输入新密码"
                        />
                    </div>
                    {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
                    {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full p-2 text-white bg-stone-800 rounded hover:bg-stone-700 disabled:bg-stone-300 transition-colors"
                    >
                        {pending ? '正在重置...' : '重置密码'}
                    </button>
                </form>
                <p className="text-sm text-center text-stone-500">
                    <a href="/auth/login" className="text-stone-800 font-medium hover:underline">返回登录</a>
                </p>
            </div>
        </div>
    );
}

import { Suspense } from 'react';

export default function NewPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewPasswordContent />
        </Suspense>
    );
}
