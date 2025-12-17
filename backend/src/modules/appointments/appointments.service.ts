import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { AppointmentService as AppointmentServiceEntity } from './entities/appointment-service.entity';
import { ProviderLocation } from '../providers/entities/provider-location.entity';
import { Address } from '../users/entities/address.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

type StatusGroup = 'upcoming' | 'completed' | 'cancelled';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private readonly appointmentRepo: Repository<Appointment>,
    // AppointmentServiceRepo removed as creation is now handled by Appointment domain entity
    @InjectRepository(ProviderProfile)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  private readonly logger = new Logger(AppointmentsService.name);

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { providerId, clientId, serviceIds, startTime, endTime, notes } = createAppointmentDto;

    const provider = await this.providerProfileRepository.findOne({ where: { id: providerId } });
    if (!provider) {
      throw new NotFoundException(`Provider with ID "${providerId}" not found`);
    }

    const client = await this.userRepository.findOne({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException(`Client with ID "${clientId}" not found`);
    }

    const services = await this.serviceRepository.findBy({ id: In(serviceIds) });
    if (services.length !== serviceIds.length) {
      throw new NotFoundException('One or more services not found');
    }

    // Use Domain Factory
    const appointment = Appointment.create(provider, client, services, startTime, endTime, notes);

    // Save with cascade
    const savedAppointments = await this.appointmentRepo.save([appointment]);
    const savedAppointment = savedAppointments[0];

    const reloaded = await this.appointmentRepo.findOne({
      where: { id: savedAppointment.id },
      relations: ['provider', 'client', 'appointmentServices'],
    });
    if (!reloaded) {
      throw new NotFoundException(`Appointment with ID "${savedAppointment.id}" not found after save`);
    }
    return reloaded;
  }

  private statusGroupToStatuses(group: StatusGroup): AppointmentStatus[] {
    switch (group) {
      case 'completed':
        return [AppointmentStatus.COMPLETED];
      case 'cancelled':
        return [
          AppointmentStatus.CANCELLED_BY_CLIENT,
          AppointmentStatus.CANCELLED_BY_PROVIDER,
          AppointmentStatus.NO_SHOW,
        ];
      case 'upcoming':
      default:
        return [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS];
    }
  }

  private formatAddress(addr?: Address | null): string | undefined {
    if (!addr) return undefined;
    const parts = [addr.streetAddress, addr.city].filter(Boolean);
    return parts.join(', ');
  }

  private mapAppointmentToDto(appt: Appointment) {
    const providerUser: User | undefined = (appt.provider as any)?.user;
    const providerName = providerUser ? `${providerUser.firstName} ${providerUser.lastName}` : undefined;
    // Prefer mobile service address if provided, otherwise provider's primary location
    let addressStr: string | undefined = this.formatAddress(appt.serviceAddress || undefined);
    if (!addressStr) {
      const locations: ProviderLocation[] | undefined = (appt.provider as any)?.locations;
      const primaryLoc = locations?.find((l) => l.isPrimary);
      const primaryAddress = (primaryLoc as any)?.address as Address | undefined;
      addressStr = this.formatAddress(primaryAddress);
    }

    const services = (appt.appointmentServices || []).map((s) => ({
      id: s.id,
      name: s.serviceName,
      durationMinutes: s.durationMinutes,
      priceCents: s.priceCents,
    }));
    const totalPriceCents = services.reduce((sum, s) => sum + (s.priceCents || 0), 0);

    return {
      id: appt.id,
      appointmentNumber: appt.appointmentNumber,
      appointmentDate: appt.appointmentDate,
      startTime: appt.startTime,
      endTime: appt.endTime,
      status: appt.status,
      provider: {
        id: appt.provider?.id,
        name: providerName,
        businessName: appt.provider?.businessName || undefined,
        avatarUrl: providerUser?.profilePictureUrl || undefined,
      },
      services,
      totalPriceCents,
      address: addressStr,
      createdAt: appt.createdAt,
      updatedAt: appt.updatedAt,
      hoursUntil: appt.hoursUntil,
    };
  }

  async listClientAppointments(userId: string, statusGroup: StatusGroup = 'upcoming') {
    const statuses = this.statusGroupToStatuses(statusGroup);

    // Build query with necessary relations for mapping
    const qb = this.appointmentRepo
      .createQueryBuilder('appt')
      .leftJoinAndSelect('appt.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'providerUser')
      .leftJoinAndSelect('provider.locations', 'providerLocations')
      .leftJoinAndSelect('providerLocations.address', 'providerAddresses')
      .leftJoinAndSelect('appt.appointmentServices', 'appointmentServices')
      .leftJoinAndSelect('appt.serviceAddress', 'serviceAddress')
      // Use actual DB column name for client foreign key to avoid naming strategy mismatches
      .where('appt.client_id = :userId', { userId })
      .andWhere('appt.status IN (:...statuses)', { statuses });

    // Order depending on group
    if (statusGroup === 'upcoming') {
      qb.orderBy('appt.appointmentDate', 'ASC').addOrderBy('appt.startTime', 'ASC');
    } else {
      qb.orderBy('appt.appointmentDate', 'DESC').addOrderBy('appt.startTime', 'DESC');
    }

    try {
      const appts = await qb.getMany();
      const items = appts.map((a) => this.mapAppointmentToDto(a));
      return { items, count: items.length };
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (/no such table/i.test(msg) || /relation .* does not exist/i.test(msg)) {
        this.logger.warn(`Appointments schema not available; returning empty client appointments for ${userId}: ${msg}`);
        return { items: [], count: 0 };
      }
      this.logger.warn(`Failed to list client appointments for ${userId}: ${msg}`);
      return { items: [], count: 0 };
    }
  }

  async listProviderAppointments(userId: string, statusGroup: StatusGroup = 'upcoming') {
    const statuses = this.statusGroupToStatuses(statusGroup);

    const qb = this.appointmentRepo
      .createQueryBuilder('appt')
      .leftJoinAndSelect('appt.provider', 'provider')
      .leftJoin('provider.user', 'providerUser')
      .leftJoinAndSelect('provider.locations', 'providerLocations')
      .leftJoinAndSelect('providerLocations.address', 'providerAddresses')
      .leftJoinAndSelect('appt.appointmentServices', 'appointmentServices')
      .leftJoinAndSelect('appt.serviceAddress', 'serviceAddress')
      .leftJoinAndSelect('appt.client', 'client')
      .where('providerUser.id = :userId', { userId })
      .andWhere('appt.status IN (:...statuses)', { statuses });

    if (statusGroup === 'upcoming') {
      qb.orderBy('appt.appointmentDate', 'ASC').addOrderBy('appt.startTime', 'ASC');
    } else {
      qb.orderBy('appt.appointmentDate', 'DESC').addOrderBy('appt.startTime', 'DESC');
    }

    try {
      const appts = await qb.getMany();
      // When listing provider appointments, also include minimal client info
      const items = appts.map((a) => {
        const dto = this.mapAppointmentToDto(a);
        const clientUser: User | undefined = (a.client as any) as User | undefined;
        return {
          ...dto,
          client: clientUser
            ? {
                id: clientUser.id,
                name: `${clientUser.firstName} ${clientUser.lastName}`,
                avatarUrl: clientUser.profilePictureUrl || undefined,
              }
            : undefined,
        };
      });
      return { items, count: items.length };
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (/no such table/i.test(msg) || /relation .* does not exist/i.test(msg)) {
        this.logger.warn(`Appointments schema not available; returning empty provider appointments for ${userId}: ${msg}`);
        return { items: [], count: 0 };
      }
      this.logger.warn(`Failed to list provider appointments for ${userId}: ${msg}`);
      return { items: [], count: 0 };
    }
  }
}