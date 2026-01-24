import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Fix import path to point to existing entity
import { ServiceCategory } from '../entities/service-category.entity';

@Controller('services/categories')
export class ServiceCategoriesController {
    constructor(
        @InjectRepository(ServiceCategory)
        private readonly categoryRepo: Repository<ServiceCategory>,
    ) { }

    @Get()
    async findAll() {
        const categories = await this.categoryRepo.find({
            where: { isActive: true },
            order: { displayOrder: 'ASC', nameDe: 'ASC' },
        });
        return categories;
    }
}
