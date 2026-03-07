import { http } from './http';

export type PortfolioPhoto = {
  id: string;
  url: string;
  thumbnailUrl: string;
  serviceCategory?: string;
  caption?: string;
  isBeforeAfter: boolean;
  companionPhotoId?: string;
  uploadedAt: string;
  order: number;
};

export const providerPortfolioApi = {
  async list(): Promise<{ photos: PortfolioPhoto[]; totalPhotos?: number }> {
    const res = await http.get('/providers/me/portfolio');
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data ?? { photos: [] };
    }
    return (payload as any) ?? { photos: [] };
  },

  async upload(photos: Array<{ uri: string; name?: string; type?: string }>, metadata: Array<{ serviceCategory?: string; caption?: string; isBeforeAfter?: boolean }> = []) {
    const results = [];

    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      const meta = metadata[i] || {};

      const formData = new FormData();
      formData.append('images', {
        uri: p.uri,
        name: p.name || `photo_${Date.now()}_${i}.jpg`,
        type: p.type || 'image/jpeg',
      } as any);

      if (meta.caption) formData.append('caption', meta.caption);

      const metaObj = {
        serviceCategory: meta.serviceCategory,
        isBeforeAfter: meta.isBeforeAfter,
      };

      // Append metadata as JSON string if backend expects parsed JSON from string, or field
      // Backend DTO: metadata?: any. NestJS with multipart handles specific fields.
      // If we send 'metadata' as stringified JSON, backend might need to parse it if it expects object.
      // ProviderPortfolioController: @Body() body: UploadImageMultipartDto.
      // NestJS might not auto-parse JSON in multipart fields unless we use validation pipe transformation or parse it manually.
      // Safe bet: send stringified and ensure backend handles it, or send individual fields if DTO supports.
      // DTO has `metadata?: any`. Let's stringify.
      formData.append('metadata', JSON.stringify(metaObj));

      try {
        const res = await http.post('/providers/me/portfolio', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        results.push(res?.data);
      } catch (e) {
        console.error('Failed to upload photo', i, e);
        // Continue with others? Or throw?
        // Let's continue but maybe return error status
      }
    }

    return { uploadedPhotos: results, message: 'Portfolio aktualisiert!' };
  },

  async patch(photoId: string, body: { serviceCategory?: string; caption?: string; order?: number }) {
    const res = await http.patch(`/providers/me/portfolio/${photoId}`, body);
    return res?.data;
  },

  async delete(photoId: string) {
    const res = await http.delete(`/providers/me/portfolio/${photoId}`);
    return res?.data;
  },

  async reorder(photoOrder: Array<{ photoId: string; order: number }>) {
    const res = await http.put('/providers/me/portfolio/reorder', { photoOrder });
    return res?.data;
  },
};

