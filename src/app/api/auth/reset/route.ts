import { db } from '@/lib/db';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/mail';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        const existingUser = await db.user.findUnique({
            where: { email },
        });

        // To prevent enumeration attacks, we might want to return 200 even if user not found.
        if (existingUser) {
            const passwordResetToken = await generatePasswordResetToken(email);
            await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);
        }

        return NextResponse.json({ success: 'Reset email sent' }, { status: 200 });
    } catch (error) {
        console.error('API Reset Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
