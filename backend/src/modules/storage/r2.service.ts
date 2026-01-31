import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class R2Service {
  private s3?: S3Client;
  private localUploadsRoot: string;

  constructor() {
    const endpoint =
      process.env.R2_ENDPOINT || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (endpoint && accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
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
        console.warn('[R2Service] Upload to R2 failed, falling back to local storage:', (err as Error)?.message);
        // Intentionally fall through to local filesystem fallback
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

  async getPublicUrl(bucket: string, key: string): Promise<string> {
    const publicBaseUrl =
      process.env.R2_PUBLIC_BASE_URL ||
      process.env.R2_PUBLIC_URL ||
      'https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev';

    // If using local storage fallback (no s3 client or forced local)
    if (!this.s3 || process.env.USE_LOCAL_STORAGE === 'true') {
      return `/uploads/${bucket}/${key}`;
    }

    const base = publicBaseUrl.replace(/\/$/, '');
    return `${base}/${key}`;
  }
}