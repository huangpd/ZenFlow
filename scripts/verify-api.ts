import { db } from '../src/lib/db';

const BASE_URL = 'http://localhost:3002/api/auth';

async function main() {
    const email = `api-test-${Date.now()}@example.com`;
    const password = 'password123';
    const newPassword = 'newPassword456';

    console.log(`Starting API Verification for ${email}...`);

    // 1. Register
    console.log('\n1. Testing Register...');
    const regRes = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Api Tester', email, password }),
    });
    const regData = await regRes.json();
    console.log(`Status: ${regRes.status}`, regData);

    if (regRes.status !== 201) throw new Error('Registration failed');

    // 2. Login (Should fail/unverified)
    console.log('\n2. Testing Login (Unverified)...');
    const loginRes1 = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const loginData1 = await loginRes1.json();
    console.log(`Status: ${loginRes1.status}`, loginData1);
    // Expect 403 or error

    // 3. Manual Verification (Get token from DB)
    console.log('\n3. Fetching Verification Token from DB...');
    const verifyToken = await db.verificationToken.findFirst({
        where: { identifier: email },
    });
    if (!verifyToken) throw new Error('Verification token not found in DB');
    console.log('Token:', verifyToken.token);

    console.log('   Testing Verify API...');
    const verifyRes = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken.token }),
    });
    const verifyData = await verifyRes.json();
    console.log(`Status: ${verifyRes.status}`, verifyData);
    if (verifyRes.status !== 200) throw new Error('Verification failed');

    // 4. Login (Should success)
    console.log('\n4. Testing Login (Verified)...');
    const loginRes2 = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const loginData2 = await loginRes2.json();
    console.log(`Status: ${loginRes2.status}`, loginData2);
    if (loginRes2.status !== 200) throw new Error('Login failed');

    // 5. Password Reset Request
    console.log('\n5. Testing Password Reset Request...');
    const resetRes = await fetch(`${BASE_URL}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const resetData = await resetRes.json();
    console.log(`Status: ${resetRes.status}`, resetData);
    if (resetRes.status !== 200) throw new Error('Reset request failed');

    // 6. Fetch Reset Token
    console.log('\n6. Fetching Reset Token... ');
    const resetTokenObj = await db.passwordResetToken.findFirst({
        where: { email },
    });
    if (!resetTokenObj) throw new Error('Reset token not found');

    // 7. New Password
    console.log('\n7. Testing New Password...');
    const newPassRes = await fetch(`${BASE_URL}/new-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetTokenObj.token, password: newPassword }),
    });
    const newPassData = await newPassRes.json();
    console.log(`Status: ${newPassRes.status}`, newPassData);
    if (newPassRes.status !== 200) throw new Error('New password failed');

    // 8. Login with New Password
    console.log('\n8. Testing Login (New Password)...');
    const loginRes3 = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
    });
    const loginData3 = await loginRes3.json();
    console.log(`Status: ${loginRes3.status}`, loginData3);
    if (loginRes3.status !== 200) throw new Error('Final login failed');

    console.log('\nAPI Verification Completed Successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
