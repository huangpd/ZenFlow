'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';
import { verifyTurnstileToken } from '@/lib/turnstile';

/**
 * 处理新用户注册
 * @param prevState 初始状态
 * @param formData 注册表单数据 (email, password, name)
 */
export async function register(prevState: any, formData: FormData) {
  const token = formData.get('cf-turnstile-response') as string;
  const verification = await verifyTurnstileToken(token);

  if (!verification.success) {
    return { error: '人机验证失败，请重试' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password) {
    return { error: '请填写邮箱和密码' };
  }

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: '该邮箱已被注册' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);
  try {
    await sendVerificationEmail(verificationToken.identifier, verificationToken.token);
  } catch (error) {
    return { error: '发送验证邮件失败，请稍后重试' };
  }

  return { success: '验证邮件已发送，请登录您的邮箱查收并激活账号！若未收到，请检查垃圾邮件箱。', error: '' };
}