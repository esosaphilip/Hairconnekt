import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, PriceType } from './entities/service.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { ServiceCategory } from './entities/service-category.entity';

import { StorageService } from '../storage/storage.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ProviderProfile)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
    @InjectRepository(ServiceCategory)
    private readonly serviceCategoryRepository: Repository<ServiceCategory>,
    private readonly storageService: StorageService,
  ) { }

  async listCategories(): Promise<ServiceCategory[]> {
    return this.serviceCategoryRepository.find({ where: { isActive: true }, order: { nameDe: 'ASC' } });
  }

  async getProviderIdByUserId(userId: string): Promise<string> {
    try {
      // Simplified lookup using standard findOne which is more robust
      const provider = await this.providerProfileRepository.findOne({
        where: { user: { id: userId } }, // Using relation instead of explicit column
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

    // ROBUSTNESS FIX: Handle "cat_" legacy IDs by looking up the real UUID
    // Mobile app might send "cat_braids" if it fell back to local constants.
    if (createDto.categoryId && typeof createDto.categoryId === 'string') {
      if (createDto.categoryId.startsWith('cat_')) {
        // Extract slug: "cat_braids" -> "braids"
        const slug = createDto.categoryId.replace('cat_', '');
        const category = await this.serviceCategoryRepository.findOne({ where: { slug } });

        if (category) {
          console.log(`[ServicesService] Resolved legacy ID ${createDto.categoryId} to UUID ${category.id}`);
          createDto.categoryId = category.id;
        } else {
          console.warn(`[ServicesService] Could not resolve legacy category ID: ${createDto.categoryId}`);
          // Let it fail at DB level or proceed if it's somehow valid
        }
      } else {
        // Standard UUID validation could go here optionally
        // checks existence if we wanted strictness
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
        createDto.categoryId, // Pass string directly
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
    if (createDto.requiresConsultation !== undefined) service.requiresConsultation = createDto.requiresConsultation;
    if (createDto.displayOrder !== undefined) service.displayOrder = createDto.displayOrder;
    if (createDto.tags !== undefined) service.tags = createDto.tags; // Map tags

    // Explicitly set providerId to ensure strict foreign key mapping
    service.providerId = providerId;

    try {
      const saved = await this.serviceRepository.save(service);
      console.log('[ServicesService] Service created successfully:', {
        id: saved.id,
        name: saved.name,
        providerId: saved.provider.id,
        categoryId: saved.categoryId
      });
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
      console.log(`[ServicesService] Listing services for provider: ${providerId}`);
      const services = await this.serviceRepository.find({
        where: { providerId },
        order: {
          displayOrder: 'ASC',
          name: 'ASC',
        },
      });
      console.log(`[ServicesService] Found ${services.length} services for provider ${providerId}`);
      return services;
    } catch (error) {
      console.error('[ServicesService] listForProvider Error:', error);
      // DEBUG: Return actual error message to frontend to identify the SQL issue
      throw new BadRequestException(`DB Error: ${(error as any).message}`);
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

    if (service.providerId !== providerId) {
      throw new NotFoundException(`Service with ID "${id}" not found for this provider`);
    }

    // Handle category update
    if (updateDto.categoryId !== undefined) {
      if (updateDto.categoryId === '') {
        throw new BadRequestException('Category is required');
      }

      // Handle legacy IDs
      if (updateDto.categoryId.startsWith('cat_')) {
        const slug = updateDto.categoryId.replace('cat_', '');
        const category = await this.serviceCategoryRepository.findOne({ where: { slug } });
        if (category) {
          service.categoryId = category.id;
        } else {
          // If we can't resolve it, we shouldn't try to save 'cat_' to a UUID column
          console.warn(`[ServicesService] Could not resolve legacy category ID in update: ${updateDto.categoryId}`);
          throw new BadRequestException('Invalid category ID');
        }
      } else {
        service.categoryId = updateDto.categoryId;
      }
    }

    // Handle tags update
    if (updateDto.tags !== undefined) {
      service.tags = updateDto.tags;
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

    if (updateDto.requiresConsultation !== undefined) {
      service.requiresConsultation = updateDto.requiresConsultation;
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

    if (service.providerId !== providerId) {
      throw new NotFoundException(`Service with ID "${id}" not found for this provider`);
    }

    await this.serviceRepository.remove(service);
  }

  async uploadImage(providerId: string, file: any) {
    if (!file?.buffer || !file?.originalname) {
      throw new BadRequestException('Image file is required');
    }

    // Upload to R2 (using generic provider context)
    const { url } = await this.storageService.uploadImage(providerId, file.buffer, file.originalname);
    return { url };
  }
}
