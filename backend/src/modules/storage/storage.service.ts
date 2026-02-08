import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { B2Service } from './b2.service';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  constructor(private readonly b2: B2Service) { }

  async uploadImage(providerId: string, fileBuffer: Buffer, filename: string) {
    try {
      // Validate file buffer
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new BadRequestException('File buffer is empty');
      }

      // Validate file size
      if (fileBuffer.length > this.MAX_FILE_SIZE) {
        const sizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
        throw new BadRequestException(`File too large (${sizeMB}MB). Maximum size is 10MB`);
      }

      // Validate filename
      if (!filename || filename.trim() === '') {
        throw new BadRequestException('Filename is required');
      }

      const bucket = process.env.B2_BUCKET || 'hairconnekt-images';
      const key = `providers/${providerId}/${Date.now()}-${filename}`;

      // Determine and validate content type
      const extension = filename.toLowerCase().split('.').pop();
      const contentTypeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
      };

      const contentType = contentTypeMap[extension || ''];

      if (!contentType) {
        throw new BadRequestException(
          `Unsupported file format: .${extension}. Allowed formats: jpg, jpeg, png, gif, webp`
        );
      }

      // Validate MIME type
      if (!this.ALLOWED_MIME_TYPES.includes(contentType)) {
        throw new BadRequestException(`Invalid image type: ${contentType}`);
      }

      this.logger.log(`Uploading image: ${key} (${(fileBuffer.length / 1024).toFixed(2)}KB, ${contentType})`);

      // Upload to B2
      const result = await this.b2.uploadObject(bucket, key, fileBuffer, contentType);

      this.logger.log(`Successfully uploaded: ${result.url}`);

      return result; // { url: string }
    } catch (error) {
      // Re-throw BadRequestException as-is
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log and wrap other errors
      this.logger.error(`Upload failed for ${filename}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Image upload failed. Please try again with a different image.';
      throw new BadRequestException(errorMessage);
    }
  }
}