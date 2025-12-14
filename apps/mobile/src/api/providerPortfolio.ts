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
    const form = new FormData();
    photos.forEach((p, i) => {
      form.append('photos', { uri: p.uri, name: p.name || `photo_${i}.jpg`, type: p.type || 'image/jpeg' } as any);
    });
    form.append('metadata', JSON.stringify(metadata));
    const res = await http.post('/providers/me/portfolio/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data ?? { uploadedPhotos: [], message: '' };
    }
    return (payload as any) ?? { uploadedPhotos: [], message: '' };
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

