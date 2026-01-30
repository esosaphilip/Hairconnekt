
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// Try to load dotenv if available, otherwise assume env vars are set
try { require('dotenv').config(); } catch (e) { }

const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

// Config from env
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
// Default to the known bucket if not set, or override per folder
const DEFAULT_BUCKET = process.env.R2_BUCKET || 'hairconnekt-images';

async function migrate() {
    if (!fs.existsSync(UPLOADS_DIR)) {
        console.error(`Uploads directory not found at ${UPLOADS_DIR}`);
        return;
    }

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
        console.error('Missing R2 configuration. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.');
        return;
    }

    const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
    });

    console.log(`Starting migration from ${UPLOADS_DIR}...`);

    // Read top-level directories (which represent buckets in R2Service logic)
    const items = fs.readdirSync(UPLOADS_DIR);

    for (const item of items) {
        const itemPath = path.join(UPLOADS_DIR, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            // Treat directory name as bucket name (unless it looks like a file extension or garbage)
            const bucketName = item;
            console.log(`Processing bucket folder: ${bucketName}`);
            await processDirectory(s3, bucketName, itemPath, '');
        } else {
            console.warn(`Skipping file at root of uploads (expected bucket folders): ${item}`);
        }
    }
    console.log('Migration completed.');
}

async function processDirectory(s3: S3Client, bucket: string, currentDir: string, keyPrefix: string) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            await processDirectory(s3, bucket, fullPath, path.join(keyPrefix, item));
        } else {
            // It's a file
            const key = path.join(keyPrefix, item);
            await uploadFile(s3, bucket, key, fullPath);
        }
    }
}

async function uploadFile(s3: S3Client, bucket: string, key: string, filePath: string) {
    try {
        const fileContent = fs.readFileSync(filePath);
        // Normalize key to use forward slashes even on Windows logic (though we are on Mac)
        const normalizedKey = key.replace(/\\/g, '/');

        console.log(`Uploading to [${bucket}]: ${normalizedKey} ...`);

        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: normalizedKey,
            Body: fileContent,
            // Guess content type or let R2 decide? R2 usually detects or defaults.
            // For images, it's good to be explicit if possible, but skipping for simplicity.
        }));
        console.log(`  -> Success`);
    } catch (error) {
        console.error(`  -> Failed to upload ${key}:`, error);
    }
}

migrate().catch(console.error);
