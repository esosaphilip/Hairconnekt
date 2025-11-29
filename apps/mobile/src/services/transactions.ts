import { http } from '../api/http';

export type BackendTransaction = {
  id: string;
  type: 'payment' | 'refund';
  provider: {
    name: string;
  };
  service: {
    name: string;
  };
  amount: number;
  createdAt: string;
  status: 'completed' | 'pending' | string;
  paymentMethod: string;
  transactionId: string;
  reason?: string;
  voucher?: {
    code: string;
  };
  originalAmount?: number;
};

export const transactionsApi = {
  async list(limit = 50): Promise<{ items: BackendTransaction[] }> {
    const res = await http.get('/payments/transactions', { params: { limit } });
    return res.data as { items: BackendTransaction[] };
  },
};
