import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (!user.emailVerified) {
            return NextResponse.json({ error: 'Email not verified' }, { status: 403 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // For Android, we might return a JWT token here if we implemented JWT auth manually.
        // However, NextAuth usually typically handles sessions via cookies.
        // For a simple native app integration with NextAuth, we can try to use standard 'credentials' signin via REST
        // OR just return the user info and let the Android app handle state if we trust it (stateless/basic auth).

        // BUT, standard NextAuth 'signIn' is not easily callable from an API route to set a cookie on the caller 
        // without using the standard NextAuth endpoints (/api/auth/signin).
        // The Android App typically sends a POST to `/api/auth/callback/credentials`.

        // To simplify for this "migration", we will return the User Object.
        // The Android "Auth" implementation usually needs a persistent token (JWT).
        // ZenFlow currently uses Database Sessions (Adapter).

        // TEMPORARY SOLUTION FOR PHASE 1:
        // Just verify credentials and return success. 
        // Real production apps should implement JWT issuance here (e.g. sign a token using jsonwebtoken).

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image
            }
        }, { status: 200 });

    } catch (error) {
        console.error('API Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
