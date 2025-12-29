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
    const { getStorageRef } = require('../config/firebase');
    const { getAuthBundle } = require('../auth/tokenStorage');
    const bundle = await getAuthBundle();
    const providerId = bundle?.user?.id;

    if (!providerId) throw new Error('Provider ID not found. Please login again.');

    const results = [];

    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      const meta = metadata[i] || {};
      const timestamp = Date.now();
      const path = `portfolio/${providerId}/${timestamp}_${i}.jpg`;
      const ref = getStorageRef(path);

      await ref.putFile(p.uri);
      const downloadUrl = await ref.getDownloadURL();

      // Metadata fields
      const metaObj = {
        serviceCategory: meta.serviceCategory,
        isBeforeAfter: meta.isBeforeAfter,
      };

      // Post URL to backend
      const res = await http.post('/providers/portfolio/url', {
        imageUrl: downloadUrl,
        caption: meta.caption,
        metadata: JSON.stringify(metaObj)
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

