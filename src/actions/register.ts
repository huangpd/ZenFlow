'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * 处理新用户注册
 * @param prevState 初始状态
 * @param formData 注册表单数据 (email, password, name)
 */
export async function register(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: 'User already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  return { success: 'User created successfully', error: '' };
}