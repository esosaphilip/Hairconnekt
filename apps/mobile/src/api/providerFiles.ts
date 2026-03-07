import { http } from './http';

export const providerFilesApi = {

  async uploadAvatar(file: { uri: string; name?: string; type?: string }) {
    const form = new FormData();
    form.append('file', {
      uri: file.uri,
      name: file.name || 'avatar.jpg',
      type: file.type || 'image/jpeg',
    } as any);
    const res = await http.post('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res?.data;
  },

  async uploadProviderProfilePicture(file: { uri: string; name?: string; type?: string }) {
    const form = new FormData();
    form.append('file', {
      uri: file.uri,
      name: file.name || 'profile.jpg',
      type: file.type || 'image/jpeg',
    } as any);
    
    // Explicitly add a console log to debug headers
    console.log('Uploading Profile Picture to: /providers/me/profile-picture');

    const res = await http.post('/providers/me/profile-picture', form, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        // 'Accept': 'application/json', // optional, usually default
      },
    });
    return res?.data;
  },

  async uploadPortfolioImages(
    files: { uri: string; name?: string; type?: string }[],
    meta: { category?: string; caption?: string; tags?: string }
  ) {
    const form = new FormData();
    files.forEach((file) => {
      form.append('images', {
        uri: file.uri,
        name: file.name || `portfolio_${Date.now()}.jpg`,
        type: file.type || 'image/jpeg',
      } as any);
    });
    if (meta.category) form.append('category', meta.category);
    if (meta.caption) form.append('caption', meta.caption);
    if (meta.tags) form.append('tags', meta.tags);
    const res = await http.post('/providers/me/portfolio', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res?.data;
  },

  async uploadServiceImage(file: { uri: string; name?: string; type?: string }) {
    const form = new FormData();
    form.append('file', {
      uri: file.uri,
      name: file.name || 'service.jpg',
      type: file.type || 'image/jpeg',
    } as any);
    const res = await http.post('/providers/me/services/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res?.data;
  },

};
