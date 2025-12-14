import { http } from './http';

export const providerReviewsApi = {
  async list(params: { filter?: 'all' | 'unanswered' | 'positive' | 'negative'; sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest'; page?: number; limit?: number } = {}) {
    const res = await http.get('/providers/me/reviews', { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async respond(reviewId: string, response: string) {
    const res = await http.post(`/reviews/${reviewId}/respond`, { response });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async editResponse(reviewId: string, response: string) {
    const res = await http.patch(`/reviews/${reviewId}/respond`, { response });
    return res?.data;
  },

  async report(reviewId: string, body: { reason: 'spam' | 'inappropriate' | 'fake' | 'abusive' | 'other'; details?: string }) {
    const res = await http.post(`/reviews/${reviewId}/report`, body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },
};

