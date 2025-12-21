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
      relations: ['user', 'certifications', 'availability'],
    });
  }

  async findByUserId(userId: string): Promise<ProviderProfile | null> {
    return this.providersRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'certifications', 'availability'],
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
          provider: { id: providerId } as any,
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
          provider: { id: providerId } as any,
          language: lang,
        })
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
      .where('appointment.provider = :providerId', { providerId })
      .andWhere('appointment.appointment_date >= :startDate', { startDate })
      .andWhere('appointment.appointment_date <= :endDate', { endDate })
      .orderBy('appointment.start_time', 'ASC')
      .getMany();
  }

  async getReviewStats(providerId: string): Promise<{ avgRating: number; reviewCount: number }> {
    const { avgRating, reviewCount } = await this.reviewsRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avgRating')
      .addSelect('COUNT(r.id)', 'reviewCount')
      .where('r.provider = :providerId', { providerId })
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
      .leftJoin('a.appointmentServices', 'as')
      .select('COALESCE(SUM(as.price_cents), 0)', 'totalCents')
      .where('a.provider = :providerId', { providerId })
      .andWhere('a.status = :status', { status: 'COMPLETED' })
      .andWhere('a.appointment_date BETWEEN :start AND :end', {
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
    const distanceExpr =
      `6371 * 2 * ASIN(SQRT(POWER(SIN((CAST(addr.latitude AS double precision) - :lat) * pi() / 180 / 2), 2) ` +
      `+ COS(:lat * pi() / 180) * COS(CAST(addr.latitude AS double precision) * pi() / 180) ` +
      `* POWER(SIN((CAST(addr.longitude AS double precision) - :lon) * pi() / 180 / 2), 2)))`;

    const qb = this.providersRepo
      .createQueryBuilder('p')
      .leftJoin('p.user', 'u')
      .leftJoin('p.locations', 'pl')
      .leftJoin('pl.address', 'addr')
      .where('addr.latitude IS NOT NULL AND addr.longitude IS NOT NULL')
      .andWhere('p.user_id IS NOT NULL')
      .select('p.id', 'id')
      .addSelect('u.first_name', 'first_name')
      .addSelect('u.last_name', 'last_name')
      .addSelect('p.business_name', 'business_name')
      .addSelect('p.cover_photo_url', 'cover_photo_url')
      .addSelect('p.is_verified', 'is_verified')
      .addSelect('p.accepts_same_day_booking', 'accepts_same_day_booking')
      .addSelect(`(${distanceExpr})`, 'distance_km')
      .groupBy('p.id')
      .addGroupBy('u.first_name')
      .addGroupBy('u.last_name')
      .addGroupBy('p.business_name')
      .addGroupBy('p.cover_photo_url')
      .addGroupBy('p.is_verified')
      .addGroupBy('p.accepts_same_day_booking')
      .addGroupBy('addr.latitude')
      .addGroupBy('addr.longitude')
      .having(`(${distanceExpr}) <= :radiusKm`)
      .orderBy('distance_km', 'ASC')
      .limit(limit)
      .setParameters({ lat, lon, radiusKm });

    return await qb.getRawMany();
  }

  async getServicesForProviders(providerIds: string[]): Promise<any[]> {
    if (providerIds.length === 0) return [];
    return await this.servicesRepo
      .createQueryBuilder('svc')
      .leftJoin('svc.provider', 'p')
      .select('p.id', 'provider_id')
      .addSelect('svc.name', 'name')
      .addSelect('svc.price_cents', 'price_cents')
      .where('p.id IN (:...ids)', { ids: providerIds })
      .andWhere('svc.is_active = :active', { active: true })
      .orderBy('svc.display_order', 'ASC')
      .limit(200) // Safety limit
      .getRawMany();
  }

  async getRatingsForProviders(providerIds: string[]): Promise<any[]> {
    if (providerIds.length === 0) return [];
    return await this.reviewsRepo
      .createQueryBuilder('r')
      .leftJoin('r.provider', 'p')
      .select('p.id', 'provider_id')
      .addSelect('AVG(r.rating)', 'avg_rating')
      .addSelect('COUNT(*)', 'reviews')
      .where('p.id IN (:...ids)', { ids: providerIds })
      .groupBy('p.id')
      .getRawMany();
  }

  async findServiceStats(providerId: string): Promise<any[]> {
    return await this.servicesRepo
      .createQueryBuilder('svc')
      .select('svc.name', 'name')
      .addSelect('svc.price_cents', 'price_cents')
      .where('svc.provider = :id', { id: providerId })
      .andWhere('svc.is_active = :active', { active: true })
      .orderBy('svc.display_order', 'ASC')
      .limit(200)
      .getRawMany();
  }
}
