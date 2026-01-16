import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
        }

        const existingToken = await db.passwordResetToken.findUnique({
            where: { token },
        });

        if (!existingToken) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
        }

        const hasExpired = new Date(existingToken.expires) < new Date();

        if (hasExpired) {
            return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
        }

        const existingUser = await db.user.findUnique({
            where: { email: existingToken.email },
        });

        if (!existingUser) {
            return NextResponse.json({ error: 'Email does not exist' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword },
        });

        await db.passwordResetToken.delete({
            where: { id: existingToken.id },
        });

        return NextResponse.json({ success: 'Password updated' }, { status: 200 });

    } catch (error) {
        console.error('API New Password Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
