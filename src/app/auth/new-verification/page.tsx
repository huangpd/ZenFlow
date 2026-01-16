'use client';

import { newVerification } from '@/actions/new-verification';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, Suspense } from 'react';

function VerificationContent() {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const onSubmit = useCallback(() => {
        if (success || error) return;

        if (!token) {
            setError('Missing token!');
            return;
        }

        newVerification(token)
            .then((data) => {
                setSuccess(data.success);
                setError(data.error);
            })
            .catch(() => {
                setError('Something went wrong!');
            });
    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-4 border rounded-lg shadow-sm bg-white">
                <h1 className="text-2xl font-bold text-center">验证您的邮箱</h1>
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    {!success && !error && (
                        <div className="animate-pulse">正在验证...</div>
                    )}
                    {success && (
                        <div className="p-3 text-sm text-green-500 bg-green-100 rounded-md">
                            {success}
                        </div>
                    )}
                    {!success && error && (
                        <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                            {error}
                        </div>
                    )}

                    <a href="/auth/login" className="text-sm text-stone-600 hover:underline">
                        返回登录
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function NewVerificationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerificationContent />
        </Suspense>
    );
}
