import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  constructor() {
    // Use Cloudflare R2 (S3-compatible) - B2 credentials are expired
    const accountId = process.env.R2_ACCOUNT_ID || '';
    this.s3Client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadImage(folderPath: string, fileBuffer: Buffer, filename: string): Promise<{ url: string }> {
    try {
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new BadRequestException('File buffer is empty');
      }

      if (fileBuffer.length > this.MAX_FILE_SIZE) {
        const sizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
        throw new BadRequestException(`File too large (${sizeMB}MB). Maximum size is 10MB`);
      }

      if (!filename || filename.trim() === '') {
        throw new BadRequestException('Filename is required');
      }

      const extension = filename.toLowerCase().split('.').pop() || '';
      const contentTypeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
      };

      const contentType = contentTypeMap[extension];
      if (!contentType || !this.ALLOWED_MIME_TYPES.includes(contentType)) {
        throw new BadRequestException(`Invalid image type. Allowed: jpg, jpeg, png, gif, webp`);
      }

      const bucket = process.env.R2_BUCKET || 'hairconnekt-images';
      const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `${folderPath}/${Date.now()}-${cleanFilename}`;

      this.logger.log(`Uploading image: ${key} (${(fileBuffer.length / 1024).toFixed(2)}KB, ${contentType})`);

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
        })
      );

      const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL || `https://pub-54d0ff210bf448eebf0f240d376a9358.r2.dev`;
      const url = `${publicBaseUrl}/${key}`;

      this.logger.log(`Successfully uploaded: ${url}`);
      return { url };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const rawMsg = (error as any)?.message || String(error);
      this.logger.error(`Upload failed for ${filename}: [${(error as any)?.Code || (error as any)?.name}] ${rawMsg}`);
      throw new BadRequestException(`Image upload failed: ${(error as any)?.Code || rawMsg}`);
    }
  }
}