'use server';

import { db } from '@/lib/db';

export async function newVerification(token: string) {
    const existingToken = await db.verificationToken.findUnique({
        where: { token },
    });

    if (!existingToken) {
        return { error: 'Token does not exist!' };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: 'Token has expired!' };
    }

    const existingUser = await db.user.findUnique({
        where: { email: existingToken.identifier },
    });

    if (!existingUser) {
        return { error: 'Email does not exist!' };
    }

    await db.user.update({
        where: { id: existingUser.id },
        data: {
            emailVerified: new Date(),
            email: existingToken.identifier, // Updates email if user changed it (not the case here but good practice usually)
        },
    });

    await db.verificationToken.delete({
        where: { id: existingToken.id },
    });

    return { success: 'Email verified!' };
}
