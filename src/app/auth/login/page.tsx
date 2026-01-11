'use client';

import { login } from '@/actions/login';
import { useActionState } from 'react';

const initialState = {
  error: '',
};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-4 border rounded-lg">
        <h1 className="text-2xl font-bold">Login</h1>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input name="email" type="email" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input name="password" type="password" required className="w-full p-2 border rounded" />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {pending ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-center">
          Don't have an account? <a href="/auth/register" className="text-blue-600">Register</a>
        </p>
      </div>
    </div>
  );
}