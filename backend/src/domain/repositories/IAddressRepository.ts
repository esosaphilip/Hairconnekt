import { Address } from '../../modules/users/entities/address.entity';

export interface IAddressRepository {
  countByUserId(userId: string): Promise<number>;
  findAllByUserId(userId: string): Promise<Address[]>;
  findById(id: string): Promise<Address | null>;
  save(address: Address): Promise<Address>;
  delete(id: string): Promise<void>;
  resetDefaults(userId: string): Promise<void>;
}
