import { generatePasswordResetToken } from '../src/lib/tokens';
import { sendPasswordResetEmail } from '../src/lib/mail';
import { db } from '../src/lib/db';

async function main() {
    const email = `1655979823@qq.com`; // Using the real email for testing
    console.log('Testing Password Reset with email:', email);

    try {
        console.log('Generating password reset token...');
        const token = await generatePasswordResetToken(email);
        console.log('Token generated:', token.token);

        console.log('Sending reset email...');

        await sendPasswordResetEmail(token.email, token.token);
        console.log('Email sent successfully!');

    } catch (error) {
        console.error('Script failed:', error);
    } finally {
        // optional cleanup, but maybe keep it so user can click the link?
        // If I cleanup, the token is gone and link won't work.
        // So I will NOT cleanup the token this time, or wait significantly.
        // Actually, let's NOT cleanup so I can potentially click it if I wanted to (though action deletes it).
        // But for this script, I just want to verify email sending.
        console.log('Done (Token kept for manual testing if needed)');
    }
}

main();
