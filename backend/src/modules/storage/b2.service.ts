import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class B2Service {
  private s3: S3Client;
  private readonly logger = new Logger(B2Service.name);
  private readonly publicBaseUrl: string;

  constructor() {
    const keyId = process.env.B2_KEY_ID;
    const applicationKey = process.env.B2_APPLICATION_KEY;
    const region = process.env.B2_REGION || 'eu-central-003';

    if (!keyId || !applicationKey) {
      throw new Error('Backblaze B2 Credentials missing. Deployment aborted.');
    }

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://s3.${region}.backblazeb2.com`,
      credentials: {
        accessKeyId: keyId,
        secretAccessKey: applicationKey
      },
    });

    // Backblaze B2 public URL format: https://f{region-number}.backblazeb2.com/file/{bucket-name}
    const bucketName = process.env.B2_BUCKET || 'hairconnekt-images';
    this.publicBaseUrl = (
      process.env.B2_PUBLIC_URL ||
      `https://f003.backblazeb2.com/file/${bucketName}`
    ).replace(/\/$/, '');
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