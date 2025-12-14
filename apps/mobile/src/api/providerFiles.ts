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

