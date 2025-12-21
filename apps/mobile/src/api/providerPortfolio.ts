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
    // We need the provider ID for the backend DTO
    // Dynamic import to avoid cycles if necessary, or assume it's available. 
    // Since getAuthBundle is in auth/tokenStorage, we import it.
    const { getAuthBundle } = require('../auth/tokenStorage');
    const bundle = await getAuthBundle();
    const providerId = bundle?.user?.id;

    if (!providerId) throw new Error('Provider ID not found. Please login again.');

    const results = [];

    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      const meta = metadata[i] || {};

      const form = new FormData();
      // 'image' matches FileInterceptor('image') in backend controller
      form.append('image', {
        uri: p.uri,
        name: p.name || `photo_${Date.now()}_${i}.jpg`,
        type: p.type || 'image/jpeg',
      } as any);

      form.append('providerId', providerId);
      if (meta.caption) form.append('caption', meta.caption);

      // Metadata fields
      const metaObj = {
        serviceCategory: meta.serviceCategory,
        isBeforeAfter: meta.isBeforeAfter,
      };
      form.append('metadata', JSON.stringify(metaObj));

      // Post to the correct endpoint
      const res = await http.post('/providers/portfolio', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      results.push(res?.data);
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

