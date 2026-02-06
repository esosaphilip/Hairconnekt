import { Injectable } from '@nestjs/common';
import { R2Service } from './r2.service';

@Injectable()
export class StorageService {
  constructor(private readonly r2: R2Service) { }

  async uploadImage(providerId: string, fileBuffer: Buffer, filename: string) {
    const bucket =
      process.env.R2_BUCKET || process.env.R2_BUCKET_NAME || 'hairconnekt-images';
    const key = `providers/${providerId}/${Date.now()}-${filename}`;

    // Determine content type from filename
    const extension = filename.toLowerCase().split('.').pop();
    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const contentType = contentTypeMap[extension || ''] || 'image/jpeg';

    // uploadObject now returns { url } directly
    const result = await this.r2.uploadObject(bucket, key, fileBuffer, contentType);
    return result; // { url: string }
  }
}