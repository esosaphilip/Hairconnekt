# Image Upload Implementation for Debugging

This document contains the core code responsible for handling image uploads in the HairConnekt application, covering both the NestJS backend and React Native frontend.

---

## 1. Backend Implementation

### Storage Service (Core Upload Logic)
**File:** `backend/src/modules/storage/storage.service.ts`
This service handles the direct interaction with Cloudflare R2 (S3-compatible storage).

```typescript
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
```

### Providers Controller (API Endpoint)
**File:** `backend/src/modules/providers/providers-me.controller.ts`
This controller receives the file upload request and delegates to the PortfolioService.

```typescript
@Post('portfolio')
@UseInterceptors(FilesInterceptor('images', 10, { storage: memoryStorage() }))
async uploadPortfolioImages(
    @Req() req: Request,
    @UploadedFiles() files: any[],
    @Body() body: any,
) {
    const userId = (req.user as any)?.sub || (req.user as any)?.id;
    const providerId = await this.servicesService.getProviderIdByUserId(userId);

    if (!files || files.length === 0) {
        return { success: false, message: 'No images provided' };
    }

    const results = await Promise.all(
        files.map(file => this.portfolioService.uploadMultipart(providerId, file, body))
    );
    return { success: true, data: results };
}
```

### Portfolio Service (Business Logic)
**File:** `backend/src/modules/portfolio/portfolio.service.ts`
This service coordinates the upload and saves the metadata to the database.

```typescript
// Upload via multipart file; returns created PortfolioImage
async uploadMultipart(
  providerId: string,
  file: { buffer: Buffer; originalname: string },
  fields: { caption?: string; tags?: string | string[]; metadata?: any },
) {
  const provider = await this.providerRepo.findOne({ where: { id: providerId } });
  if (!provider) throw new NotFoundException('Provider not found');
  if (!file?.buffer || !file?.originalname) throw new BadRequestException('Image file is required');

  const { url } = await this.storage.uploadImage(`portfolio/${providerId}`, file.buffer, file.originalname);

  // Compute next display order
  const raw = await this.imagesRepo
    .createQueryBuilder('img')
    .where('img.provider.id = :pid', { pid: provider.id })
    .select('MAX(img.display_order)', 'max')
    .getRawOne<{ max: string | null }>();
  const nextDisplayOrder = raw?.max ? Number(raw.max) + 1 : 1;

  // ... (Metadata parsing logic omitted for brevity) ...

  const image = this.imagesRepo.create({
    provider,
    imageUrl: url,
    thumbnailUrl: url,
    caption: fields.caption ?? null,
    // ... other fields
    displayOrder: nextDisplayOrder,
  });
  const saved = await this.imagesRepo.save(image);
  await this.cache.deleteByPrefix('portfolio:discover');
  return saved;
}
```

---

## 2. Frontend Implementation

### API Service (Frontend)
**File:** `apps/mobile/src/api/providerFiles.ts`
This service prepares the `FormData` and sends the request to the backend.

```typescript
import { http } from './http';

export const providerFilesApi = {
  async upload(file: { uri: string; name?: string; type?: string }, type: 'avatar' | 'cover' | 'portfolio' | 'service' | 'document') {
    const form = new FormData();
    form.append('file', { uri: file.uri, name: file.name || 'upload', type: file.type || 'application/octet-stream' } as any);
    form.append('type', type);
    const res = await http.post('/providers/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },
};
```

### Upload Portfolio Screen (UI & Logic)
**File:** `apps/mobile/src/screens/provider/UploadPortfolioScreen.tsx`
**Note:** The upload logic in `handleSubmit` is currently disabled/placeholder.

```typescript
import * as ImagePicker from 'expo-image-picker';

// ...

const launchImageLibraryAsync = async (callback: (assets: ImageAsset[]) => void) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: 10,
    quality: 0.8,
  } as any);

  if (!result.canceled && result.assets) {
    const mappedAssets: ImageAsset[] = result.assets.map((asset: any) => ({
      uri: asset.uri,
      fileName: asset.fileName || `photo_${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
      fileSize: asset.fileSize,
    }));
    callback(mappedAssets);
  }
};

// ...

const handleSubmit = async () => {
  if (images.length === 0) {
    Alert.alert('Fehler', 'Bitte mindestens ein Bild auswählen');
    return;
  }
  if (!formData.category) {
    Alert.alert('Fehler', 'Bitte eine Kategorie auswählen');
    return;
  }
  // [UPLOAD-REMOVED] Portfolio upload logic removed — rebuild with new upload system
  Alert.alert('Funktion nicht verfügbar', 'Portfolio-Upload wird in Kürze unterstützt.');
};
```

---

## 3. Critical Debugging Findings (Discrepancy Analysis)

**WARNING:** There are significant mismatches between the frontend API calls and the backend endpoints. You must fix these for uploads to work.

### 1. Portfolio Upload Mismatch
- **Frontend (`providerPortfolio.ts`):**
  - Calls: `POST /providers/portfolio`
  - Field Name: `image` (singular)
- **Backend (`ProvidersMeController`):**
  - Endpoint: `POST /providers/me/portfolio` (Note the `/me` segment)
  - Field Name: `images` (plural, via `FilesInterceptor('images')`)
- **Fix Required:** Update frontend to use correct URL and field name.

### 2. General File Upload Mismatch
- **Frontend (`providerFiles.ts`):**
  - Calls: `POST /providers/upload`
- **Backend:**
  - **No such endpoint exists.**
  - Available endpoints:
    - Profile Picture: `POST /providers/me/profile-picture` (field: `file`)
    - Service Image: `POST /providers/me/services/image` (field: `file`)
    - User Avatar: `POST /users/me/avatar` (field: `file`)
- **Fix Required:** Update `providerFiles.ts` to route to the specific endpoint based on the `type` parameter (e.g., if type is 'avatar', call `/users/me/avatar`).

[FIX APPLIED] The `providerFiles.ts` has been completely rewritten to use specific methods (`uploadAvatar`, `uploadProviderProfilePicture`, etc.) targeting the correct endpoints. The dead `/providers/upload` endpoint is no longer used in the codebase.
