/**
 * Live test: profile picture upload for 2 different provider accounts
 * Tests the fix for 400 "File buffer is missing" error
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE = 'http://localhost:3000/api/v1';
const pw = 'Password123!';

async function registerAndLogin(n) {
    const ts = Date.now() + n;
    const email = `upload_test_${ts}@test.com`;
    try {
        await axios.post(BASE + '/auth/register', {
            email, password: pw, firstName: 'Upload', lastName: `Test${n}`,
            phone: `+491234${ts.toString().slice(-6)}`, userType: 'PROVIDER',
        });
    } catch (e) { /* ignore if exists */ }
    const r = await axios.post(BASE + '/auth/login', { emailOrPhone: email, password: pw, userType: 'PROVIDER' });
    const token = r.data?.tokens?.accessToken;
    if (!token) throw new Error('Login failed for ' + email + ': ' + JSON.stringify(r.data));
    return { email, token };
}

async function testUpload(accountNum, token) {
    console.log(`\n  -- Account ${accountNum} --`);

    // Create a minimal 1x1 JPEG in memory (valid JPEG binary)
    // This is a known-valid minimal JPEG
    const minJpeg = Buffer.from(
        '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U' +
        'HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN' +
        'DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
        'MjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAA' +
        'AAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA' +
        '/9oADAMBAAIRAxEAPwCwABmX/9k=',
        'base64'
    );

    const tempPath = path.join('/tmp', `test_upload_${accountNum}_${Date.now()}.jpg`);
    fs.writeFileSync(tempPath, minJpeg);

    const h = axios.create({ baseURL: BASE, headers: { Authorization: 'Bearer ' + token } });

    // Test 1: GET /providers/me (provider exists)
    try {
        const me = await h.get('/providers/me');
        const id = me.data?.id ?? me.data?.data?.id;
        console.log(`  ✅ GET /providers/me → id: ${id}`);
    } catch (e) {
        console.log(`  ❌ GET /providers/me: ${e?.response?.status} ${e?.response?.data?.message}`);
    }

    // Test 2: POST /providers/me/profile-picture (the main fix)
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(tempPath), {
            filename: 'profile.jpg',
            contentType: 'image/jpeg',
        });

        const res = await h.post('/providers/me/profile-picture', form, {
            headers: { ...form.getHeaders() },
        });
        const d = res.data;
        console.log(`  ✅ POST /providers/me/profile-picture → success:${d?.success}, url:${d?.profilePictureUrl ? d.profilePictureUrl.substring(0, 60) + '...' : 'none'}`);
    } catch (e) {
        console.log(`  ❌ POST /providers/me/profile-picture: ${e?.response?.status} ${JSON.stringify(e?.response?.data)}`);
    }

    // Cleanup
    try { fs.unlinkSync(tempPath); } catch (e) { /* ignore */ }
}

async function run() {
    console.log('⏳ Waiting 3s for backend hot-reload...');
    await new Promise(r => setTimeout(r, 3000));

    console.log('\n=== Testing profile picture upload with 2 accounts ===');

    let accounts;
    try {
        accounts = await Promise.all([
            registerAndLogin(1),
            registerAndLogin(2),
        ]);
        console.log('✅ Both accounts created and logged in');
    } catch (e) {
        console.error('❌ Auth failed:', e.message);
        process.exit(1);
    }

    for (let i = 0; i < accounts.length; i++) {
        await testUpload(i + 1, accounts[i].token);
    }

    console.log('\n=== Done ===\n');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
