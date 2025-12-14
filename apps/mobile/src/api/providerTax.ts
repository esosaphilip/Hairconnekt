import { http } from './http';

export const providerTaxApi = {
  async update(body: { taxId: string; vatNumber?: string; businessLicense?: string }) {
    const res = await http.put('/providers/me/tax-info', body);
    return res?.data;
  },
};

