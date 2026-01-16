'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function newPassword(prevState: any, formData: FormData): Promise<{ error?: string; success?: string }> {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;

    if (!token) {
        return { error: 'Missing token!' };
    }

    if (!password) {
        return { error: 'Missing password!' };
    }

    const existingToken = await db.passwordResetToken.findUnique({
        where: { token },
    });

    if (!existingToken) {
        return { error: 'Invalid token!' };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: 'Token has expired!' };
    }

    const existingUser = await db.user.findUnique({
        where: { email: existingToken.email },
    });

    if (!existingUser) {
        return { error: 'Email does not exist!' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
    });

    await db.passwordResetToken.delete({
        where: { id: existingToken.id },
    });

    return { success: '密码已更新!' };
}
