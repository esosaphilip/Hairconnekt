import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './controllers/category.controller';
import { AdminCategoryService } from './services/admin-category.service';
import { ServiceCategory } from '../services/entities/service-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceCategory])],
  controllers: [CategoryController],
  providers: [AdminCategoryService],
})
export class AdminModule {}
