/**
 * Voucher Repository Interface
 * Domain layer - defines contract, no implementation
 */

import type { Voucher } from '../entities/Voucher';

export interface IVoucherRepository {
  list(): Promise<Voucher[]>;
  getById(id: string): Promise<Voucher | null>;
  create(voucher: Voucher): Promise<Voucher>;
  update(id: string, voucher: Partial<Voucher>): Promise<Voucher>;
  delete(id: string): Promise<void>;
}

