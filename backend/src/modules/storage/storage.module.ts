import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { R2Service } from './r2.service';

@Module({
  providers: [StorageService, R2Service],
  exports: [StorageService],
})
export class StorageModule {}