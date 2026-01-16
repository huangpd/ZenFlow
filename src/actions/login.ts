'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

/**
 * 处理用户登录请求
 * @param prevState 初始状态
 * @param formData 登录表单数据 (email, password)
 */
export async function login(prevState: any, formData: FormData) {
  try {
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
