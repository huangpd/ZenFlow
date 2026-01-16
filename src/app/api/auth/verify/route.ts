import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Missing token' }, { status: 400 });
        }

        const existingToken = await db.verificationToken.findUnique({
            where: { token },
        });

        if (!existingToken) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
        }

        const hasExpired = new Date(existingToken.expires) < new Date();

        if (hasExpired) {
            return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
        }

        const existingUser = await db.user.findFirst({
            where: { email: existingToken.identifier },
        });

        if (!existingUser) {
            return NextResponse.json({ error: 'Email does not exist' }, { status: 400 });
        }

        await db.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() },
        });

        await db.verificationToken.delete({
            where: { id: existingToken.id },
        });

        return NextResponse.json({ success: 'Email verified' }, { status: 200 });
    } catch (error) {
        console.error('API Verify Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
