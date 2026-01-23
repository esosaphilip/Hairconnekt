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

    await this.r2.uploadObject(bucket, key, fileBuffer);
    const url = await this.r2.getPublicUrl(bucket, key);

    return { url };
  }
}