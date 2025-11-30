import 'dotenv/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function main() {
  const bucket = process.env.B2_BUCKET || 'hairconnekt-images';
  const endpoint = process.env.B2_S3_ENDPOINT || '';
  const region = process.env.B2_S3_REGION || 'auto';
  const accessKeyId = process.env.B2_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.B2_SECRET_ACCESS_KEY || '';
  const key = `diagnostic/${Date.now()}-test.txt`;
  const body = Buffer.from('hello-b2');

  console.log('[diag] config:', { bucket, endpoint, region, haveAccess: !!accessKeyId, haveSecret: !!secretAccessKey });
  try {
    const s3 = new S3Client({ region, endpoint, credentials: { accessKeyId, secretAccessKey }, forcePathStyle: true as any });
    const put = new PutObjectCommand({ Bucket: bucket, Key: key, Body: body });
    await s3.send(put);
    console.log('[diag] put success:', { bucket, key });
    const publicBase = (process.env.B2_PUBLIC_URL || '').replace(/\/$/, '');
    const url = publicBase ? `${publicBase}/${bucket}/${key}` : `${endpoint.replace(/^https?:\/\//, 'https://')}/${bucket}/${key}`;
    console.log('[diag] public url:', url);
  } catch (e: any) {
    console.error('[diag] put error:', e?.name || '', e?.message || e);
    if (e?.$metadata) console.error('[diag] metadata:', e.$metadata);
  }
}

main().catch((e) => {
  console.error('[diag] fatal:', e);
  process.exit(1);
});
