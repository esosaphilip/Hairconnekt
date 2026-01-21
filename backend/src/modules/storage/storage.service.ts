import { Injectable } from '@nestjs/common';
import { R2Service } from './r2.service';

@Injectable()
export class StorageService {
  constructor(private readonly r2: R2Service) { }

  async uploadImage(providerId: string, fileBuffer: Buffer, filename: string) {
    // TODO: Use configured bucket and key pattern once environment & schema are provided
    const bucket =
      process.env.R2_BUCKET || process.env.R2_BUCKET_NAME || 'hairconnekt-images';
    const key = `providers/${providerId}/${Date.now()}-${filename}`;
    const result = await this.r2.uploadObject(bucket, key, fileBuffer);
    const publicBaseUrl =
      process.env.R2_PUBLIC_BASE_URL ||
      process.env.R2_PUBLIC_URL ||
      'https://pub-08fbbd44374741679ded7c08d0adad27.r2.dev';
    const base = publicBaseUrl.replace(/\/$/, '');
    // If no public base URL configured (local dev), or when falling back to local storage,
    // serve from /uploads via Express static middleware (configured in main.ts)
    const localBase = '/uploads';
    let url: string;
    if ((result as any)?.localPath) {
      url = `${localBase}/${bucket}/${key}`;
    } else if (base) {
      // R2 Public Access URL maps directly to the bucket root
      url = `${base}/${key}`;
    } else {
      url = `${localBase}/${bucket}/${key}`;
    }
    return { url };
  }
}