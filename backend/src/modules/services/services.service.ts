import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { ServiceCategory } from './entities/service-category.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ProviderProfile)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
    @InjectRepository(ServiceCategory)
    private readonly serviceCategoryRepository: Repository<ServiceCategory>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const { providerId, categoryId, ...rest } = createServiceDto;

    const provider = await this.providerProfileRepository.findOne({ where: { id: providerId } });
    if (!provider) {
      throw new NotFoundException(`Provider with ID "${providerId}" not found`);
    }

    // Optional category: fetch and narrow; coerce null to undefined for create()
    let category: ServiceCategory | undefined;
    if (categoryId) {
      const found = await this.serviceCategoryRepository.findOne({ where: { id: categoryId } });
      if (!found) {
        throw new NotFoundException(`ServiceCategory with ID "${categoryId}" not found`);
      }
      category = found;
    }

    const service: Service = this.serviceRepository.create({
      ...rest,
      provider,
      category,
    });

    return this.serviceRepository.save(service);
  }

  /**
   * List all services for a given provider (current authenticated provider)
   */
  async listForProvider(providerId: string): Promise<Service[]> {
    const provider = await this.providerProfileRepository.findOne({ where: { id: providerId } });
    if (!provider) {
      throw new NotFoundException(`Provider with ID "${providerId}" not found`);
    }
    return this.serviceRepository.find({
      where: { provider: { id: providerId } },
      relations: ['category'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async update(serviceId: string, update: Partial<Service> & { categoryId?: string }): Promise<Service> {
    const existing = await this.serviceRepository.findOne({ where: { id: serviceId }, relations: ['provider', 'category'] });
    if (!existing) throw new NotFoundException(`Service with ID "${serviceId}" not found`);

    let category = existing.category ?? null;
    if (typeof update.categoryId === 'string') {
      if (update.categoryId) {
        const found = await this.serviceCategoryRepository.findOne({ where: { id: update.categoryId } });
        if (!found) throw new NotFoundException(`ServiceCategory with ID "${update.categoryId}" not found`);
        category = found;
      } else {
        category = null;
      }
    }

    const toSave: Service = {
      ...existing,
      name: update.name ?? existing.name,
      description: update.description ?? existing.description,
      durationMinutes: typeof update.durationMinutes === 'number' ? update.durationMinutes : existing.durationMinutes,
      priceCents: typeof update.priceCents === 'number' ? update.priceCents : existing.priceCents,
      priceType: update.priceType ?? existing.priceType,
      priceMaxCents: typeof update.priceMaxCents === 'number' ? update.priceMaxCents : existing.priceMaxCents ?? null,
      isActive: typeof update.isActive === 'boolean' ? update.isActive : existing.isActive,
      displayOrder: typeof update.displayOrder === 'number' ? update.displayOrder : existing.displayOrder,
      imageUrl: update.imageUrl ?? existing.imageUrl ?? null,
      category,
    };
    return this.serviceRepository.save(toSave);
  }

  async delete(serviceId: string): Promise<void> {
    const existing = await this.serviceRepository.findOne({ where: { id: serviceId } });
    if (!existing) throw new NotFoundException(`Service with ID "${serviceId}" not found`);
    await this.serviceRepository.delete(serviceId);
  }
}
