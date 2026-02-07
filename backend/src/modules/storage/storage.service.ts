import { Injectable } from '@nestjs/common';
import { B2Service } from './b2.service';

@Injectable()
export class StorageService {
  constructor(private readonly b2: B2Service) { }

  async uploadImage(providerId: string, fileBuffer: Buffer, filename: string) {
    const bucket =
      process.env.B2_BUCKET || 'hairconnekt-images';
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
    const result = await this.b2.uploadObject(bucket, key, fileBuffer, contentType);
    return result; // { url: string }
  }
}