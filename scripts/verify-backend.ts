import { generateVerificationToken } from '../src/lib/tokens';
import { sendVerificationEmail } from '../src/lib/mail';
import { db } from '../src/lib/db';

async function main() {
    const email = `1655979823@qq.com`;
    console.log('Testing with email:', email);

    try {
        console.log('Generating token...');
        const token = await generateVerificationToken(email);
        console.log('Token generated:', token.token);

        console.log('Sending email...');

        await sendVerificationEmail(token.identifier, token.token);
        console.log('Email sent successfully!');

    } catch (error) {
        console.error('Script failed:', error);
    } finally {
        // cleanup
        try {
            await db.verificationToken.deleteMany({
                where: { identifier: email }
            });
            console.log('Cleanup done');
        } catch (e) {
            console.error('Cleanup failed', e);
        }

    }
}

main();
