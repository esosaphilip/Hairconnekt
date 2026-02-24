/**
 * Diagnostic: test R2 upload via API endpoint with a proper JPEG file
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000/api/v1';

// A proper 1x1 red JPEG (known valid)
const VALID_JPEG_B64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoH' +
    'BwYIDAoMCwsKCwsNCxAQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQME' +
    'BAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU' +
    'FBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABwYI' +
    '/8QAIhAAAQMEAwEBAQAAAAAAAAAAAQIDBAAFBhESITH/xAAUAQEAAAAAAAAAAAAAAAAA' +
    'AAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AnoYIilMNMrJcz1HS' +
    'nUcqmfYB60UZlpC31KQXHJDLV09JW5XoUFjYHjCVNxUBL6RZBslBVzNh1TbqYUMi' +
    'P91AME5VVVlXV1rw9RDaWlodRe2cALFQ/9k=';

async function run() {
    const ts = Date.now();
    const email = `r2test_${ts}@test.com`;
    const pw = 'Password123!';

    console.log('1. Registering test account...');
    try {
        await axios.post(BASE + '/auth/register', {
            email, password: pw, firstName: 'R2', lastName: 'Test',
            phone: `+491234${ts.toString().slice(-6)}`, userType: 'PROVIDER',
        });
    } catch (e) { /* ignore */ }

    console.log('2. Logging in...');
    const loginRes = await axios.post(BASE + '/auth/login', {
        emailOrPhone: email, password: pw, userType: 'PROVIDER',
    });
    const token = loginRes.data?.tokens?.accessToken;
    if (!token) { console.log('❌ No token!'); process.exit(1); }
    console.log('✅ Logged in');

    // Write a proper JPEG to disk
    const tempPath = path.join('/tmp', `r2test_${ts}.jpg`);
    fs.writeFileSync(tempPath, Buffer.from(VALID_JPEG_B64, 'base64'));
    console.log('   Temp file:', tempPath, '- size:', fs.statSync(tempPath).size, 'bytes');

    console.log('3. Uploading profile picture...');
    const form = new FormData();
    form.append('file', fs.createReadStream(tempPath), {
        filename: 'profile.jpg',
        contentType: 'image/jpeg',
    });

    try {
        const res = await axios.post(BASE + '/providers/me/profile-picture', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`,
            },
            timeout: 30000,
        });
        console.log('✅ Upload SUCCESS:', JSON.stringify(res.data).substring(0, 150));
    } catch (e) {
        console.log('❌ Upload FAILED:', e?.response?.status);
        console.log('   Body:', JSON.stringify(e?.response?.data));
        // Check if this is still B2 or now R2
        console.log('   (Checking if backend reloaded - see if error is still B2-related)');
    }

    fs.unlinkSync(tempPath);
}

run().catch(e => { console.error('Script error:', e.message); process.exit(1); });
