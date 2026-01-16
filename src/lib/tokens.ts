import { db } from '@/lib/db';
import { VerificationToken } from '@prisma/client';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export const generateVerificationToken = async (email: string): Promise<VerificationToken> => {
    // Generate a random 6-digit number
    const token = crypto.randomInt(100000, 999999).toString();
    // Set expiration to 1 hour
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    const existingToken = await db.verificationToken.findFirst({
        where: { identifier: email },
    });

    if (existingToken) {
        await db.verificationToken.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    const verificationToken = await db.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    });

    return verificationToken;
};

export const generatePasswordResetToken = async (email: string) => {
    const token = uuidv4();
    // Set expiration to 1 hour
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    const existingToken = await db.passwordResetToken.findFirst({
        where: { email },
    });

    if (existingToken) {
        await db.passwordResetToken.delete({
            where: { id: existingToken.id },
        });
    }

    const passwordResetToken = await db.passwordResetToken.create({
        data: {
            email,
            token,
            expires,
        },
    });

    return passwordResetToken;
};
