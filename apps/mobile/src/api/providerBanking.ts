import { http } from './http';

export const providerBankingApi = {
  async getBankAccounts() {
    const res = await http.get('/providers/me/bank-accounts');
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async addBankAccount(body: { accountHolder: string; iban: string; bic?: string; bankName?: string; isDefault?: boolean }) {
    const res = await http.post('/providers/me/bank-accounts', body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async updateBankAccount(accountId: string, body: { accountHolder?: string; isDefault?: boolean }) {
    const res = await http.patch(`/providers/me/bank-accounts/${accountId}`, body);
    return res?.data;
  },

  async deleteBankAccount(accountId: string) {
    const res = await http.delete(`/providers/me/bank-accounts/${accountId}`);
    return res?.data;
  },
};

