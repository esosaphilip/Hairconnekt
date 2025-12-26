import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, PriceType } from './entities/service.entity';
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
  ) { }

  async listCategories(): Promise<ServiceCategory[]> {
    return this.serviceCategoryRepository.find({ where: { isActive: true }, order: { nameDe: 'ASC' } });
  }

  async getProviderIdByUserId(userId: string): Promise<string> {
    try {
      // Simplified lookup using standard findOne which is more robust
      const provider = await this.providerProfileRepository.findOne({
        where: { user: { id: userId } },
        select: ['id'], // We only need the ID
      });

      if (!provider) {
        console.warn(`[ServicesService] Provider profile not found for userId: ${userId}`);
        throw new NotFoundException('Provider profile not found for this user');
      }
      return provider.id;
    } catch (error) {
      console.error(`[ServicesService] Error resolving provider ID for userId ${userId}:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to resolve provider profile');
    }
  }


  async create(providerId: string, createDto: any): Promise<Service> {
    // Validate provider exists
    const provider = await this.providerProfileRepository.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Provider profile not found');
    }

    // Validate and fetch category if provided
    let category: ServiceCategory | null = null;
    if (createDto.categoryId) {
      category = await this.serviceCategoryRepository.findOne({
        where: { id: createDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`Category with ID "${createDto.categoryId}" not found`);
      }
    }

    // Validate price and duration are integers
    if (createDto.priceCents !== undefined && !Number.isInteger(createDto.priceCents)) {
      throw new BadRequestException('priceCents must be an integer');
    }

    if (createDto.durationMinutes !== undefined && !Number.isInteger(createDto.durationMinutes)) {
      throw new BadRequestException('durationMinutes must be an integer');
    }

    // Create the service entity using the domain factory
    let service: Service;
    try {
      service = Service.create(
        provider,
        createDto.name,
        createDto.description || '', // Ensure valid string if entity logic requires it, though DB allows null now
        createDto.durationMinutes !== undefined ? createDto.durationMinutes : 60,
        createDto.priceCents !== undefined ? createDto.priceCents : 0,
        createDto.priceType || PriceType.FIXED,
        category ?? undefined,
        createDto.priceMaxCents ?? undefined,
        createDto.imageUrl ?? undefined,
      );
    } catch (error) {
      // Catch domain validation errors (e.g. negative price) and rethrow as 400
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(error instanceof Error ? error.message : 'Invalid service data');
    }

    // Override defaults if explicitly provided in DTO
    if (createDto.isActive !== undefined) service.isActive = createDto.isActive;
    if (createDto.allowOnlineBooking !== undefined) service.allowOnlineBooking = createDto.allowOnlineBooking;
    if (createDto.displayOrder !== undefined) service.displayOrder = createDto.displayOrder;

    try {
      const saved = await this.serviceRepository.save(service);
      console.log('[ServicesService] Service created successfully:', saved.id);
      return saved;
    } catch (error) {
      console.error('[ServicesService] Create service error:', error);
      // Handle known DB errors
      const errCode = (error as any)?.code;
      if (errCode === '23502') throw new BadRequestException('Missing required fields');
      if (errCode === '23505') throw new BadRequestException('Service name already exists');

      throw new InternalServerErrorException('Failed to create service');
    }
  }

  async listForProvider(providerId: string): Promise<Service[]> {
    try {
      return await this.serviceRepository.createQueryBuilder('s')
        .leftJoinAndSelect('s.category', 'category')
        .leftJoinAndSelect('s.provider', 'provider')
        .where('provider.id = :providerId', { providerId })
        .orderBy('s.displayOrder', 'ASC')
        .addOrderBy('s.name', 'ASC')
        .getMany();
    } catch (error) {
      console.error('[ServicesService] listForProvider Error:', error);
      throw new InternalServerErrorException('Failed to fetch services for provider');
    }
  }

  async update(id: string, providerId: string, updateDto: any): Promise<Service> {
    console.log('[Backend] UPDATE Request:', { id, providerId, updateDto: JSON.stringify(updateDto) });

    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['provider']
    });

    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    if (service.provider.id !== providerId) {
      throw new NotFoundException(`Service with ID "${id}" not found for this provider`);
    }

    // Handle category update
    if (updateDto.categoryId) {
      const category = await this.serviceCategoryRepository.findOne({ where: { id: updateDto.categoryId } });
      if (!category) {
        throw new NotFoundException(`Category with ID "${updateDto.categoryId}" not found`);
      }
      service.category = category;
    }

    // Data Translation & Mapping
    if (updateDto.name !== undefined) service.name = updateDto.name;
    if (updateDto.description !== undefined) service.description = updateDto.description;

    // STRICT MAPPING: Only accept priceCents (Integer)
    if (updateDto.priceCents !== undefined) {
      if (!Number.isInteger(updateDto.priceCents)) throw new BadRequestException('priceCents must be an integer');
      service.priceCents = updateDto.priceCents;
    }

    // STRICT MAPPING: Only accept durationMinutes
    if (updateDto.durationMinutes !== undefined) service.durationMinutes = updateDto.durationMinutes;

    if (updateDto.priceType !== undefined) service.priceType = updateDto.priceType;
    if (updateDto.priceMaxCents !== undefined) service.priceMaxCents = updateDto.priceMaxCents;
    if (updateDto.imageUrl !== undefined) service.imageUrl = updateDto.imageUrl;

    // Handle Active Toggle
    if (updateDto.isActive !== undefined) service.isActive = updateDto.isActive;

    // Handle Allow Online Booking
    if (updateDto.allowOnlineBooking !== undefined) {
      service.allowOnlineBooking = updateDto.allowOnlineBooking;
    }

    try {
      return await this.serviceRepository.save(service);
    } catch (error) {
      console.error('SQL Error Details:', error);
      throw new InternalServerErrorException('Failed to update service');
    }
  }

  async delete(id: string, providerId: string): Promise<void> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['provider'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    if (service.provider.id !== providerId) {
      throw new NotFoundException(`Service with ID "${id}" not found for this provider`);
    }

    await this.serviceRepository.remove(service);
  }
}
