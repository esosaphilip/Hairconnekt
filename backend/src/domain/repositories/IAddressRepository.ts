import { Address } from '../../modules/users/entities/address.entity';

export interface IAddressRepository {
  countByUserId(userId: string): Promise<number>;
}
