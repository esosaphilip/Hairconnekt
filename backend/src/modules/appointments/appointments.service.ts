import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Between, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { BlockedTime } from '../blocked-time/entities/blocked-time.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { User, UserType } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Address } from '../users/entities/address.entity';
import { ProviderLocation } from '../providers/entities/provider-location.entity';
import * as crypto from 'crypto';

type StatusGroup = 'upcoming' | 'completed' | 'cancelled';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(ProviderProfile)
    private readonly providerProfileRepository: Repository<ProviderProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(BlockedTime)
    private readonly blockedTimeRepo: Repository<BlockedTime>,
    private readonly notificationsService: NotificationsService,
  ) { }

  private readonly logger = new Logger(AppointmentsService.name);

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { providerId, clientId, newClient, serviceIds, startTime, endTime, notes } = createAppointmentDto;

    if (!providerId) {
      throw new BadRequestException('Provider ID is required');
    }

    const provider = await this.providerProfileRepository.findOne({
      where: { id: providerId },
      relations: ['user'] // Needed for FCM token
    });
    if (!provider) {
      throw new NotFoundException(`Provider with ID "${providerId}" not found`);
    }

    // Availability Check
    await this.checkAvailability(providerId, new Date(startTime), new Date(endTime));

    let client: User | null = null;
    if (clientId) {
      client = await this.userRepository.findOne({ where: { id: clientId } });
      if (!client) {
        throw new NotFoundException(`Client with ID "${clientId}" not found`);
      }
    } else if (newClient) {
      // Logic for new client: Find by phone or create
      client = await this.userRepository.findOne({ where: { phone: newClient.phone } });

      if (!client) {
        // Create new guest/user
        client = new User();
        client.phone = newClient.phone;
        // Generate placeholder email if not provided
        client.email = newClient.email || `guest-${newClient.phone.replace(/\D/g, '')}${Date.now().toString().slice(-4)}@hairconnekt.app`;

        const parts = newClient.name.trim().split(' ');
        client.firstName = parts[0] || 'Guest';
        client.lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Client';

        // Securely random password for guest accounts to prevent unauthorized access
        client.passwordHash = crypto.randomBytes(32).toString('hex');
        client.userType = UserType.CLIENT;
        client.isActive = true;
        // client.isGuest = true; // Field doesn't exist yet

        client = await this.userRepository.save(client);
      }
    } else {
      throw new BadRequestException('Client ID or New Client details required');
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

    // Notify Provider
    if (provider.user?.fcmToken) {
      const dateStr = savedAppointment.startTime.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      const timeStr = savedAppointment.startTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      await this.notificationsService.sendPushNotification(
        provider.user.fcmToken,
        'Neue terminanfrage',
        `${client.firstName} hat einen Termin für ${dateStr} um ${timeStr} angefragt.`,
        { type: 'appointment_request', appointmentId: savedAppointment.id }
      );
    }

    const reloaded = await this.appointmentRepo.findOne({
      where: { id: savedAppointment.id },
      relations: ['provider', 'client', 'appointmentServices'],
    });
    if (!reloaded) {
      throw new NotFoundException(`Appointment with ID "${savedAppointment.id}" not found after save`);
    }
    return reloaded;
  }

  async checkAvailability(providerId: string, start: Date, end: Date, excludeAppointmentId?: string): Promise<void> {
    // 1. Check for overlapping appointments (excluding Cancelled/NoShow)
    const overlap = await this.appointmentRepo.findOne({
      where: {
        provider: { id: providerId },
        startTime: LessThanOrEqual(end),
        endTime: MoreThanOrEqual(start),
        status: Not(In([AppointmentStatus.CANCELLED_BY_CLIENT, AppointmentStatus.CANCELLED_BY_PROVIDER, AppointmentStatus.NO_SHOW])),
        ...(excludeAppointmentId ? { id: Not(excludeAppointmentId) } : {})
      }
    });

    if (overlap) {
      // Double check strict overlap to avoid edge case where end == start
      if (overlap.startTime < end && overlap.endTime > start) {
        throw new ConflictException('Dieser Zeitraum ist bereits durch einen anderen Termin belegt.');
      }
    }

    // 2. Check for blocked time
    const dateStr = start.toISOString().split('T')[0];
    const startTimeStr = start.toISOString().substring(11, 16);
    const endTimeStr = end.toISOString().substring(11, 16);

    const blocks = await this.blockedTimeRepo.find({
      where: {
        provider: { id: providerId },
        startDate: dateStr,
      }
    });

    for (const block of blocks) {
      if (block.allDay) {
        throw new ConflictException('Dieser Zeitraum ist blockiert (Pause/Urlaub).');
      }
      if (block.startTime && block.endTime) {
        // Overlap check: (StartA < EndB) and (EndA > StartB)
        // Using string comparison for HH:mm is safe for same-day
        if (block.startTime < endTimeStr && block.endTime > startTimeStr) {
          throw new ConflictException('Dieser Zeitraum ist blockiert (Pause/Urlaub).');
        }
      }
    }
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
    const providerUser: User | undefined = appt.provider?.user;
    const providerName = providerUser ? `${providerUser.firstName} ${providerUser.lastName}` : undefined;
    // Prefer mobile service address if provided, otherwise provider's primary location
    let addressStr: string | undefined = this.formatAddress(appt.serviceAddress || undefined);
    if (!addressStr) {
      const locations: ProviderLocation[] | undefined = appt.provider?.locations;
      const primaryLoc = locations?.find((l) => l.isPrimary);
      const primaryAddress = primaryLoc?.address;
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

  async updateStatus(id: string, status: AppointmentStatus, userId: string): Promise<Appointment> {
    const appt = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['provider', 'provider.user', 'client']
    });

    if (!appt) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }

    // Ensure authorized provider
    if (appt.provider?.user?.id !== userId) {
      throw new NotFoundException('Appointment not found for this provider');
    }

    appt.status = status;
    const saveResult = await this.appointmentRepo.save(appt);

    // Notify Client
    if (appt.client?.fcmToken) {
      let title = 'Termin Update';
      let body = `Der Status deines Termins wurde aktualisiert: ${status}`;

      if (status === AppointmentStatus.CONFIRMED) {
        title = 'Termin bestätigt ✅';
        body = 'Dein Termin wurde vom Anbieter bestätigt!';
      } else if (status === AppointmentStatus.CANCELLED_BY_PROVIDER) {
        title = 'Termin abgesagt ❌';
        body = 'Dein Termin wurde leider vom Anbieter abgesagt.';
      }

      await this.notificationsService.sendPushNotification(
        appt.client.fcmToken,
        title,
        body,
        { type: 'appointment_update', appointmentId: id, status }
      );
    }

    return saveResult;
  }
}