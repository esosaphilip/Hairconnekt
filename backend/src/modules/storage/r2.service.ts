import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

@Injectable()
export class R2Service {
  private s3?: S3Client;
  private localUploadsRoot: string;

  constructor() {
    const endpoint =
      process.env.R2_ENDPOINT ||
      process.env.B2_S3_ENDPOINT ||
      (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.B2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.B2_SECRET_ACCESS_KEY;

    if (endpoint && accessKeyId && secretAccessKey) {
      const region = process.env.B2_S3_REGION || 'auto';
      this.s3 = new S3Client({
        region,
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
      } as any);
    }

    // Local fallback directory for development without R2 credentials
    this.localUploadsRoot = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.localUploadsRoot)) {
      fs.mkdirSync(this.localUploadsRoot, { recursive: true });
    }
  }

  async uploadObject(bucket: string, key: string, body: Buffer | Uint8Array | string) {
    // Try R2 (S3-compatible) upload first if configured
    if (this.s3) {
      try {
        const put = new PutObjectCommand({ Bucket: bucket, Key: key, Body: body as any });
        await this.s3.send(put);
        return { bucket, key };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[R2Service] Upload to S3/R2 failed, attempting Backblaze B2 native:', (err as Error)?.message);
        // Intentionally fall through to B2 native or local filesystem fallback
      }
    }
    // Backblaze B2 native upload (when Application Key is provided)
    const b2AccountId = process.env.B2_ACCOUNT_ID || process.env.B2_KEY_ID || '';
    const b2AppKey = process.env.B2_APPLICATION_KEY || process.env.B2_APP_KEY || '';
    const b2BucketId = process.env.B2_BUCKET_ID || '';
    if (b2AccountId && b2AppKey && b2BucketId) {
      try {
        const buf = Buffer.isBuffer(body) ? body : Buffer.from(body as any);
        const auth = await this.b2Authorize(b2AccountId, b2AppKey);
        const { uploadUrl, authorizationToken } = await this.b2GetUploadUrl(auth.apiUrl, auth.authorizationToken, b2BucketId);
        const sha1 = crypto.createHash('sha1').update(buf).digest('hex');
        await this.b2UploadFile(uploadUrl, authorizationToken, bucket, key, buf, sha1);
        return { bucket, key };
      } catch (e: any) {
        console.warn('[R2Service] Upload to Backblaze B2 native failed, falling back to local storage:', e?.message || e);
      }
    }
    // Fallback: write to local filesystem under uploads/{bucket}/{key}
    const fullPath = path.join(this.localUploadsRoot, bucket, key);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body as any);
    await fs.promises.writeFile(fullPath, buffer);
    return { bucket, key, localPath: fullPath };
  }

  async getObject(bucket: string, key: string) {
    if (this.s3) {
      const get = new GetObjectCommand({ Bucket: bucket, Key: key });
      const res = await this.s3.send(get);
      return res;
    }
    const fullPath = path.join(this.localUploadsRoot, bucket, key);
    const data = await fs.promises.readFile(fullPath);
    return { Body: data } as any;
  }

  private async b2Authorize(keyId: string, applicationKey: string): Promise<{ apiUrl: string; authorizationToken: string }>
  {
    const basic = Buffer.from(`${keyId}:${applicationKey}`).toString('base64');
    const res = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: { Authorization: `Basic ${basic}` },
    });
    if (!res.ok) throw new Error(`b2_authorize_account failed: ${res.status}`);
    const data = await res.json() as any;
    return { apiUrl: data.apiUrl, authorizationToken: data.authorizationToken };
  }

  private async b2GetUploadUrl(apiUrl: string, authToken: string, bucketId: string): Promise<{ uploadUrl: string; authorizationToken: string }>
  {
    const res = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: { Authorization: authToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketId }),
    });
    if (!res.ok) throw new Error(`b2_get_upload_url failed: ${res.status}`);
    const data = await res.json() as any;
    return { uploadUrl: data.uploadUrl, authorizationToken: data.authorizationToken };
  }

  private async b2UploadFile(uploadUrl: string, authToken: string, bucket: string, key: string, content: Buffer, sha1Hex: string): Promise<void>
  {
    // B2 requires URL-encoded file name; we store under <bucket>/<key> path for consistency
    const fileName = encodeURIComponent(`${bucket}/${key}`);
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: authToken,
        'X-Bz-File-Name': fileName,
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(content.length),
        'X-Bz-Content-Sha1': sha1Hex,
      },
      body: content as any,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`b2_upload_file failed: ${res.status} ${text}`);
    }
  }
}
