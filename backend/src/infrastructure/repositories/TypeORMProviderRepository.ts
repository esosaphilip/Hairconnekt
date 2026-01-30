import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { IProviderRepository } from '../../domain/repositories/IProviderRepository';
import { ProviderProfile } from '../../modules/providers/entities/provider-profile.entity';
import { ProviderCertification } from '../../modules/providers/entities/provider-certification.entity';
import { ProviderAvailability } from '../../modules/providers/entities/provider-availability.entity';
import { ProviderSpecialization } from '../../modules/providers/entities/provider-specialization.entity';
import { ProviderLanguage } from '../../modules/providers/entities/provider-language.entity';
import { Appointment } from '../../modules/appointments/entities/appointment.entity';
import { Review } from '../../modules/reviews/entities/review.entity';
import { Service } from '../../modules/services/entities/service.entity';

@Injectable()
export class TypeORMProviderRepository implements IProviderRepository {
  constructor(
    @InjectRepository(ProviderProfile)
    private readonly providersRepo: Repository<ProviderProfile>,
    @InjectRepository(ProviderCertification)
    private readonly certificationsRepo: Repository<ProviderCertification>,
    @InjectRepository(ProviderAvailability)
    private readonly availabilityRepo: Repository<ProviderAvailability>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepo: Repository<Appointment>,
    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,
    @InjectRepository(Service)
    private readonly servicesRepo: Repository<Service>,
    private readonly entityManager: EntityManager,
  ) { }

  async findById(id: string): Promise<ProviderProfile | null> {
    return this.providersRepo.findOne({
      where: { id },
      relations: ['user', 'certifications', 'availability', 'languages', 'specializations'],
    });
  }

  async findByUserId(userId: string): Promise<ProviderProfile | null> {
    return this.providersRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'certifications', 'availability', 'languages', 'specializations', 'locations', 'locations.address'],
    });
  }

  async save(provider: ProviderProfile): Promise<ProviderProfile> {
    return this.providersRepo.save(provider);
  }

  async updateSpecializations(providerId: string, specializations: string[]): Promise<void> {
    await this.entityManager.transaction(async (manager) => {
      await manager.delete(ProviderSpecialization, { provider: { id: providerId } });
      const newSpecs = specializations.map((spec) =>
        manager.create(ProviderSpecialization, {
          provider: { id: providerId } as ProviderProfile,
          specialization: spec,
        })
      );
      if (newSpecs.length > 0) {
        await manager.save(newSpecs);
      }
    });
  }

  async updateLanguages(providerId: string, languages: string[]): Promise<void> {
    await this.entityManager.transaction(async (manager) => {
      await manager.delete(ProviderLanguage, { provider: { id: providerId } });
      const newLangs = languages.map((lang) =>
        manager.create(ProviderLanguage, {
          provider: { id: providerId } as ProviderProfile,
          languageCode: lang,
          proficiency: 'NATIVE', // Default proficiency
        } as unknown as ProviderLanguage)
      );
      if (newLangs.length > 0) {
        await manager.save(newLangs);
      }
    });
  }

  async countCertifications(providerId: string): Promise<number> {
    return this.certificationsRepo.count({ where: { provider: { id: providerId } } });
  }

  async saveCertification(certification: ProviderCertification): Promise<ProviderCertification> {
    return this.certificationsRepo.save(certification);
  }

  async findCertificationById(id: string): Promise<ProviderCertification | null> {
    return this.certificationsRepo.findOne({
      where: { id },
      relations: ['provider'],
    });
  }

  async removeCertification(certification: ProviderCertification): Promise<void> {
    await this.certificationsRepo.remove(certification);
  }

  async replaceAvailability(providerId: string, slots: ProviderAvailability[]): Promise<ProviderAvailability[]> {
    // Transactional replace
    return await this.entityManager.transaction(async (manager) => {
      const existing = await manager.find(ProviderAvailability, { where: { provider: { id: providerId } } });
      if (existing.length) {
        await manager.remove(existing);
      }
      return await manager.save(slots);
    });
  }

  async findAppointmentsForDashboard(providerId: string, date: string): Promise<Appointment[]> {
    return this.appointmentsRepo.find({
      where: { provider: { id: providerId }, appointmentDate: date },
      relations: ['client', 'appointmentServices'],
      order: { startTime: 'ASC' },
    });
  }

  async findAppointmentsInDateRange(providerId: string, startDate: string, endDate: string): Promise<Appointment[]> {
    return this.appointmentsRepo.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.client', 'client')
      .leftJoinAndSelect('appointment.appointmentServices', 'appointmentServices')
      .where('appointment.provider.id = :providerId', { providerId })
      .andWhere('appointment.appointmentDate >= :startDate', { startDate })
      .andWhere('appointment.appointmentDate <= :endDate', { endDate })
      .orderBy('appointment.startTime', 'ASC')
      .getMany();
  }

  async getReviewStats(providerId: string): Promise<{ avgRating: number; reviewCount: number }> {
    const { avgRating, reviewCount } = await this.reviewsRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avgRating')
      .addSelect('COUNT(r.id)', 'reviewCount')
      .where('r.provider.id = :providerId', { providerId }) // Assuming Review entity has provider relation. If explicit column added there, use r.providerId
      .getRawOne<{ avgRating: string; reviewCount: string }>()
      .then((row) => ({
        avgRating: row?.avgRating ? parseFloat(row.avgRating) : 0,
        reviewCount: row?.reviewCount ? parseInt(row.reviewCount, 10) : 0,
      }));
    return { avgRating, reviewCount };
  }

  async getWeekEarnings(providerId: string, start: Date, end: Date): Promise<number> {
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const earningsRows = await this.appointmentsRepo
      .createQueryBuilder('a')
      .leftJoin('a.provider', 'p')
      .leftJoin('a.appointmentServices', 'as')
      .select('COALESCE(SUM(as.priceCents), 0)', 'totalCents')
      .where('p.id = :providerId', { providerId })
      .andWhere('a.status = :status', { status: 'COMPLETED' })
      .andWhere('a.appointmentDate BETWEEN :start AND :end', {
        start: startStr,
        end: endStr,
      })
      .getRawOne<{ totalCents: string }>();
    return earningsRows?.totalCents ? parseInt(earningsRows.totalCents, 10) : 0;
  }

  async findRecentReviews(providerId: string, limit: number): Promise<Review[]> {
    return this.reviewsRepo.find({
      where: { provider: { id: providerId } },
      relations: ['client'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findAllAppointments(providerId: string): Promise<Appointment[]> {
    return this.appointmentsRepo.find({
      where: { provider: { id: providerId } },
      relations: ['client', 'appointmentServices'],
      order: { appointmentDate: 'DESC', startTime: 'DESC' },
    });
  }

  async findNearby(params: { lat: number; lon: number; radiusKm: number; limit: number }): Promise<any[]> {
    const { lat, lon, radiusKm, limit } = params;
    // Haversine formula (in kilometers) using Postgres math functions
    // Calculate Bounding Box for initial filtering (optimizes query and avoids math errors on full table)
    // 1 degree latitude ~ 111km
    // 1 degree longitude ~ 111km * cos(latitude)
    const latDelta = radiusKm / 111;
    const lonDelta = radiusKm / (111 * Math.cos(lat * (Math.PI / 180)));

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLon = lon - lonDelta;
    const maxLon = lon + lonDelta;

    const qb = this.providersRepo
      .createQueryBuilder('p')
      .leftJoin('p.user', 'u')
      .leftJoin('p.locations', 'pl')
      .leftJoin('pl.address', 'addr')
      .where('addr.latitude IS NOT NULL AND addr.longitude IS NOT NULL')
      // Apply Bounding Box Filter
      .andWhere('CAST(addr.latitude AS double precision) BETWEEN :minLat AND :maxLat', { minLat, maxLat })
      .andWhere('CAST(addr.longitude AS double precision) BETWEEN :minLon AND :maxLon', { minLon, maxLon })
      .andWhere('u.id IS NOT NULL')
      .select('p.id', 'id')
      .addSelect('u.firstName', 'firstName')
      .addSelect('u.lastName', 'lastName')
      .addSelect('p.businessName', 'businessName')
      .addSelect('p.coverPhotoUrl', 'coverPhotoUrl')
      .addSelect('p.isVerified', 'isVerified')
      .addSelect('p.acceptsSameDayBooking', 'acceptsSameDayBooking')
      .addSelect('addr.latitude', 'latitude')
      .addSelect('addr.longitude', 'longitude')
      .groupBy('p.id')
      .addGroupBy('u.id')
      .addGroupBy('pl.id')
      .addGroupBy('addr.id')
      .addGroupBy('addr.latitude')
      .addGroupBy('addr.longitude');
    // Removed ORDER BY distanceKm from SQL to avoid expression errors

    const rawResults = await qb.getRawMany();
    // eslint-disable-next-line no-console
    console.log(`[ProvidersRepository] Bounding box query returned ${rawResults.length} raw rows`);

    // Calculate distance and sort in memory
    const resultsWithDistance = rawResults.map((r) => {
      const pLat = parseFloat(r.latitude);
      const pLon = parseFloat(r.longitude);

      const R = 6371; // Radius of the earth in km
      const dLat = (pLat - lat) * (Math.PI / 180);
      const dLon = (pLon - lon) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * (Math.PI / 180)) * Math.cos(pLat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in km

      return { ...r, distanceKm: d };
    });

    // Sort by distance ASC
    resultsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    // Limit
    return resultsWithDistance.slice(0, limit);
  }

  async getServicesForProviders(providerIds: string[]): Promise<any[]> {
    if (providerIds.length === 0) return [];
    return await this.servicesRepo
      .createQueryBuilder('svc')
      // Removed join to provider, using providerId directly
      .select('svc.providerId', 'providerId')
      .addSelect('svc.name', 'name')
      .addSelect('svc.priceCents', 'priceCents')
      .where('svc.providerId IN (:...ids)', { ids: providerIds })
      .andWhere('svc.isActive = :active', { active: true })
      .orderBy('svc.displayOrder', 'ASC')
      .limit(200) // Safety limit
      .getRawMany();
  }

  async getRatingsForProviders(providerIds: string[]): Promise<any[]> {
    if (providerIds.length === 0) return [];
    return await this.reviewsRepo
      .createQueryBuilder('r')
      .leftJoin('r.provider', 'p')
      .select('p.id', 'providerId')
      .addSelect('AVG(r.rating)', 'avgRating')
      .addSelect('COUNT(*)', 'reviews')
      .where('p.id IN (:...ids)', { ids: providerIds })
      .groupBy('p.id')
      .getRawMany();
  }

  async findServiceStats(providerId: string): Promise<any[]> {
    return await this.servicesRepo
      .createQueryBuilder('svc')
      // Removed join to provider, using providerId directly
      .select('svc.name', 'name')
      .addSelect('svc.priceCents', 'priceCents')
      .where('svc.providerId = :id', { id: providerId })
      .andWhere('svc.isActive = :active', { active: true })
      .orderBy('svc.displayOrder', 'ASC')
      .limit(200)
      .getRawMany();
  }
}
