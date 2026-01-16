import { db } from '@/lib/db';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        const verificationToken = await generateVerificationToken(email);
        await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

        return NextResponse.json({ success: 'User registered. Please check email for verification code.' }, { status: 201 });
    } catch (error) {
        console.error('API Register Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
