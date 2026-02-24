/**
 * Diagnostic test: expose raw S3 error from Backblaze upload
 */
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const BASE = 'http://localhost:3000/api/v1';

console.log('=== Backblaze B2 Config ===');
console.log('B2_S3_ENDPOINT:', process.env.B2_S3_ENDPOINT);
console.log('B2_S3_REGION:', process.env.B2_S3_REGION);
console.log('B2_ACCESS_KEY_ID:', process.env.B2_ACCESS_KEY_ID ? process.env.B2_ACCESS_KEY_ID.substring(0, 8) + '...' : 'MISSING');
console.log('B2_SECRET_ACCESS_KEY:', process.env.B2_SECRET_ACCESS_KEY ? '***set***' : 'MISSING');
console.log('B2_BUCKET:', process.env.B2_BUCKET);
console.log('R2_PUBLIC_BASE_URL:', process.env.R2_PUBLIC_BASE_URL);

async function testS3Direct() {
    console.log('\n=== Direct S3 Upload Test ===');
    const client = new S3Client({
        endpoint: process.env.B2_S3_ENDPOINT || 'https://s3.eu-central-003.backblazeb2.com',
        region: process.env.B2_S3_REGION || 'eu-central-003',
        credentials: {
            accessKeyId: process.env.B2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
    });

    const minJpeg = Buffer.from(
        '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB' +
        'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARAAgABAAMBEQAC' +
        'EQEDEQESADEAAf/aAAwDAQACEQMRAD8AB9z/AP/Z',
        'base64'
    );

    try {
        const bucket = process.env.B2_BUCKET || 'hairconnekt-images';
        const key = `test/diagnostic-${Date.now()}.jpg`;
        console.log(`Uploading to bucket: ${bucket}, key: ${key}`);

        await client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: minJpeg,
            ContentType: 'image/jpeg',
        }));
        console.log('✅ Direct S3 upload SUCCESS!');
    } catch (e) {
        console.log('❌ Direct S3 upload FAILED:');
        console.log('  Code:', e.Code || e.name);
        console.log('  Message:', e.message);
        console.log('  StatusCode:', e.$metadata?.httpStatusCode);
    }
}

async function testViaApi() {
    console.log('\n=== API Upload Test (via backend) ===');
    const ts = Date.now();
    const email = `diag_${ts}@test.com`;
    const pw = 'Password123!';

    try {
        await axios.post(BASE + '/auth/register', {
            email, password: pw, firstName: 'Diag', lastName: 'Test',
            phone: `+491234${ts.toString().slice(-6)}`, userType: 'PROVIDER',
        });
        const r = await axios.post(BASE + '/auth/login', { emailOrPhone: email, password: pw, userType: 'PROVIDER' });
        const token = r.data?.tokens?.accessToken;

        // Create a temp JPEG file
        const minJpeg = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEBUTEhMWFhUXFxgYGBgYGBcaGhcYGBcXGBcYGBcYHSggGBolHRcXITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAB0AHAMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAFBgMEAAIHAf/EACsQAAIBAgUDBAIDAQAAAAAAAAECAwQRBRIhMUFRYQZxgRMykaEUQv/EABkBAAIDAQAAAAAAAAAAAAAAAAMFAAIEAf/EACQRAAICAQQCAwEBAAAAAAAAAAECAxEEEiExQWETIlH/2gAMAwEAAhEDEQA/AO2UpKKbeiSbfRJXb8klqz5c4rh6kJVKdOcqcXKc1Fvliu78kl19HY7OFqOVKlKS5pU4OX8pNr0OhxBb03OdOMpQi5RjKUVJxTaSk0m02k2rt6JtK68nK/HmLrV40aOHm6k0m1TpOTSer8EpXjF6Jyb2Ws3oktF7MxrVW6k/eUqe0m3tDKlHdqV4pRaXPe+WXi/C9XYLZ4njVenBRjOrKEI35YxlKKXRNJK7eiSV3ZJK7bNsHUlOjBzknKaTk401FN23UUkkvJJJdEeAVp8sXLe6inKPdJKzXVXSdmrNXTd9bh/SuBw9fDYitOrUipU41VT5o0oNOLhFJq8rNtSfPbXRGVjqaVKNVrb3sZuWXbybTm36s5qclJXfKnYqHoWvRjJRi5NKUkm0m7J6ttpXsrtt2RxVwlKrNVauH9nVnzwnNWTlH5ZKUXytWlaLTV11sHXFpqkWllf7Ni4fJBJVYS3hNJp9VJaX1V7GaXqNLVf8EgzH0q7r4jCyqVXJ1HCUHJyk5N8spSab1k7ttu7be7OfPJt8MJXlJtttybertv1bMprEVoxikpJJKS2TSTSevVJJ38mDK08Orayn6s7PCkox+tC8YpXaWyV9FoEkXm5bdFVVwAqsrqvH/9k=', 'base64');
        const tempPath = `/tmp/diag_${ts}.jpg`;
        fs.writeFileSync(tempPath, minJpeg);

        const form = new FormData();
        form.append('file', fs.createReadStream(tempPath), { filename: 'profile.jpg', contentType: 'image/jpeg' });

        const uploadRes = await axios.post(BASE + '/providers/me/profile-picture', form, {
            headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
        });
        console.log('✅ API Upload SUCCESS:', JSON.stringify(uploadRes.data).substring(0, 100));
        fs.unlinkSync(tempPath);
    } catch (e) {
        console.log('❌ API Upload FAILED:', e?.response?.status, JSON.stringify(e?.response?.data));
    }
}

(async () => {
    await testS3Direct();
    await testViaApi();
    console.log('\n=== Done ===');
})();
