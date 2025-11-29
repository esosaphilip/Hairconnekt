import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { AddressesController } from './addresses.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { AddressesService } from './addresses.service';
import { ClientProfilesService } from './client-profiles.service';
import { PreferencesController } from './preferences.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Address, ClientProfile]),
  ],
  controllers: [UsersController, AddressesController, PreferencesController],
  providers: [UsersService, AddressesService, ClientProfilesService],
  exports: [UsersService],
})
export class UsersModule {}