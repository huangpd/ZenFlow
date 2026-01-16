console.log('Loading email-verification.test.ts');
import { register } from '@/actions/register';
import { newVerification } from '@/actions/new-verification';
import { db } from '@/lib/db';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    }),
}));

describe('Email Verification Flow', () => {
    const testEmail = `verification-test-${Date.now()}@example.com`;
    const testPassword = 'password123';
    const testName = 'Verification User';

    // Clean up after tests
    afterAll(async () => {
        // Delete the user (should accept cascade delete for tokens if configured, else delete manually)
        // Prisma schema shows cascade delete on relations usually.
        const user = await db.user.findUnique({ where: { email: testEmail } });
        if (user) {
            await db.user.delete({ where: { id: user.id } });
        }
    });

    it('should register user, generate token, send email, and verify email', async () => {
        // 1. Register User
        const formData = new FormData();
        formData.append('email', testEmail);
        formData.append('password', testPassword);
        formData.append('name', testName);

        const registerResult = await register(null, formData);

        // Expect success message
        expect(registerResult.success).toContain('Verification email sent');
        expect(registerResult.error).toBe('');

        // 2. Check User created and Not Verified
        const user = await db.user.findUnique({ where: { email: testEmail } });
        expect(user).toBeDefined();
        expect(user?.emailVerified).toBeNull();
        expect(user?.password).toBeDefined(); // Should be hashed

        // 3. Check Verification Token created
        const token = await db.verificationToken.findFirst({
            where: { identifier: testEmail },
        });
        expect(token).toBeDefined();
        expect(token?.token).toBeDefined();

        // 4. Check Email Sent (Mock)
        const nodemailerMock = require('nodemailer');
        const transporter = nodemailerMock.createTransport();
        // Verify sendMail was called
        expect(transporter.sendMail).toHaveBeenCalledTimes(1);
        const mailOptions = transporter.sendMail.mock.calls[0][0];
        expect(mailOptions.to).toBe(testEmail);
        expect(mailOptions.html).toContain(token?.token); // Link should contain token

        // 5. Verify Email
        if (!token) throw new Error('Token not found');
        const verifyResult = await newVerification(token.token);
        expect(verifyResult.success).toBe('Email verified!');
        expect(verifyResult.error).toBeUndefined();

        // 6. Check User Verified
        const verifiedUser = await db.user.findUnique({ where: { email: testEmail } });
        expect(verifiedUser?.emailVerified).not.toBeNull();

        // 7. Check Token Deleted
        const deletedToken = await db.verificationToken.findUnique({
            where: {
                identifier_token: {
                    identifier: testEmail,
                    token: token.token
                }
            }
        });
        expect(deletedToken).toBeNull();
    });
});
