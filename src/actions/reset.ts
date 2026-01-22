'use server';

import { db } from '@/lib/db';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/mail';
import { verifyTurnstileToken } from '@/lib/turnstile';

export async function reset(prevState: any, formData: FormData): Promise<{ error?: string; success?: string }> {
    const token = formData.get('cf-turnstile-response') as string;
    const verification = await verifyTurnstileToken(token);

    if (!verification.success) {
        return { error: '人机验证失败，请重试' };
    }

    const email = formData.get('email') as string;

    if (!email) {
        return { error: 'Email is required' };
    }

    const existingUser = await db.user.findUnique({
        where: { email },
    });

    if (!existingUser) {
        // Return success to avoid enumerating emails?
        // Or return error if UX prioritizes feedback. 
        // Usually for "Forgot Password" it's safer to say "If email exists, we sent a link".
        // But here I'll just return a success message regardless, or specific error if dev mode.
        // Let's return "Reset email sent!" regardless of user existence to prevent enumeration,
        // BUT we only send email if user exists.
        return { success: '重置邮件已发送！' };
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

    return { success: '重置邮件已发送！' };
}
