import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private s3: S3Client;
  private readonly logger = new Logger(R2Service.name);
  private readonly publicBaseUrl: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('R2 Credentials missing. Deployment aborted.');
    }

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    this.publicBaseUrl = (process.env.R2_PUBLIC_BASE_URL || 'https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev').replace(/\/$/, '');
  }

  async uploadObject(bucket: string, key: string, body: Buffer | Uint8Array | string, contentType: string = 'image/jpeg') {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType // Critical for browsers to render images correctly
      });

      await this.s3.send(command);
      return { url: this.getPublicUrl(key) };
    } catch (err) {
      this.logger.error(`Upload failed for ${key}:`, err);
      throw new InternalServerErrorException('Image upload failed');
    }
  }

  getPublicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }
}