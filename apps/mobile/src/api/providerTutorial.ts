import { http } from './http';

export const providerTutorialApi = {
  async complete() {
    const res = await http.post('/providers/me/complete-tutorial');
    return res?.data;
  },
};

