import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceCategory } from '../../services/entities/service-category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class AdminCategoryService {
  constructor(
    @InjectRepository(ServiceCategory)
    private readonly categoryRepository: Repository<ServiceCategory>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<ServiceCategory> {
    const existing = await this.categoryRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });
    if (existing) {
      throw new ConflictException(`Category with slug "${createCategoryDto.slug}" already exists`);
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<ServiceCategory[]> {
    return this.categoryRepository.find({
      order: { displayOrder: 'ASC', nameDe: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ServiceCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<ServiceCategory> {
    const category = await this.findOne(id);

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });
      if (existing) {
        throw new ConflictException(`Category with slug "${updateCategoryDto.slug}" already exists`);
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    // Soft delete or hard delete? Prompt says:
    // "Ensure that if a Category is deleted (soft delete), the services linked to it remain but are marked as 'Uncategorized' or the Category is marked inactive"
    // For simplicity and safety, let's mark as inactive instead of deleting relations.
    const category = await this.findOne(id);
    category.isActive = false;
    await this.categoryRepository.save(category);
  }
}
