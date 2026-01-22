'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { verifyTurnstileToken } from '@/lib/turnstile';

/**
 * 处理用户登录请求
 * @param prevState 初始状态
 * @param formData 登录表单数据 (email, password)
 */
export async function login(prevState: any, formData: FormData) {
  try {
    const token = formData.get('cf-turnstile-response') as string;
    const verification = await verifyTurnstileToken(token);

    if (!verification.success) {
      return { error: '人机验证失败，请重试' };
    }

    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: '无效的用户名或者密码' };
        default:
          return { error: 'Something went wrong.' };
      }
    }
    throw error;
  }
}
