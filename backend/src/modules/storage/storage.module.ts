import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { B2Service } from './b2.service';

@Module({
  providers: [StorageService, B2Service],
  exports: [StorageService],
})
export class StorageModule { }