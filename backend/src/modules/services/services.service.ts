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

    // Use Domain Factory
    const service = Service.create(
      provider,
      rest.name,
      rest.description ?? '',
      rest.durationMinutes,
      rest.priceCents,
      rest.priceType,
      category,
      rest.priceMaxCents,
      rest.imageUrl,
    );

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
}