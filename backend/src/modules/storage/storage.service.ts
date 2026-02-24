import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.B2_ENDPOINT || 'https://s3.eu-central-003.backblazeb2.com',
      region: process.env.B2_REGION || 'eu-central-003',
      credentials: {
        accessKeyId: process.env.B2_KEY_ID || '',
        secretAccessKey: process.env.B2_APPLICATION_KEY || '',
      },
      // Force path style for S3-compatible endpoints
      forcePathStyle: true,
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

      const bucket = process.env.B2_BUCKET || 'hairconnekt-images';
      // Clean filename to remove weird characters
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

      // Backblaze public URL format: Note that R2_PUBLIC_BASE_URL might be repurposed in the .env to the Backblaze url
      const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL || `https://f003.backblazeb2.com/file/${bucket}`;
      const url = `${publicBaseUrl}/${key}`;

      this.logger.log(`Successfully uploaded: ${url}`);
      return { url };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Upload failed for ${filename}:`, error);
      throw new BadRequestException('Image upload failed. Please try again.');
    }
  }
}