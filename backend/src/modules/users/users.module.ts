import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { AddressesController } from './addresses.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { UserReport } from './entities/report.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { AddressesService } from './addresses.service';
import { ClientProfilesService } from './client-profiles.service';
import { PreferencesController } from './preferences.controller';

import { TypeORMUserRepository } from '../../infrastructure/repositories/TypeORMUserRepository';
import { TypeORMAddressRepository } from '../../infrastructure/repositories/TypeORMAddressRepository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      Address, 
      ClientProfile, 
      BlockedUser, 
      UserReport,
      Appointment,
      Favorite
    ]),
  ],
  controllers: [UsersController, AddressesController, PreferencesController],
  providers: [
    UsersService,
    AddressesService,
    ClientProfilesService,
    {
      provide: 'IUserRepository',
      useClass: TypeORMUserRepository,
    },
    {
      provide: 'IAddressRepository',
      useClass: TypeORMAddressRepository,
    },
  ],
  exports: [UsersService, 'IUserRepository', 'IAddressRepository'],
})
export class UsersModule { }