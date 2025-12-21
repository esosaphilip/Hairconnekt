import { ProviderProfile } from '../../modules/providers/entities/provider-profile.entity';
import { ProviderCertification } from '../../modules/providers/entities/provider-certification.entity';
import { ProviderAvailability } from '../../modules/providers/entities/provider-availability.entity';
import { Appointment } from '../../modules/appointments/entities/appointment.entity';
import { Review } from '../../modules/reviews/entities/review.entity';
import { Service } from '../../modules/services/entities/service.entity';

export interface IProviderRepository {
  // Basic CRUD
  findById(id: string): Promise<ProviderProfile | null>;
  findByUserId(userId: string): Promise<ProviderProfile | null>;
  save(provider: ProviderProfile): Promise<ProviderProfile>;

  // Relations Updates
  updateSpecializations(providerId: string, specializations: string[]): Promise<void>;
  updateLanguages(providerId: string, languages: string[]): Promise<void>;

  // Certifications
  countCertifications(providerId: string): Promise<number>;
  saveCertification(certification: ProviderCertification): Promise<ProviderCertification>;
  findCertificationById(id: string): Promise<ProviderCertification | null>;
  removeCertification(certification: ProviderCertification): Promise<void>;

  // Availability
  replaceAvailability(providerId: string, slots: ProviderAvailability[]): Promise<ProviderAvailability[]>;

  // Dashboard / Complex Queries
  findAppointmentsForDashboard(providerId: string, date: string): Promise<Appointment[]>;
  findAppointmentsInDateRange(providerId: string, startDate: string, endDate: string): Promise<Appointment[]>;
  getReviewStats(providerId: string): Promise<{ avgRating: number; reviewCount: number }>;
  getWeekEarnings(providerId: string, start: Date, end: Date): Promise<number>;
  findRecentReviews(providerId: string, limit: number): Promise<Review[]>;

  // Clients
  findAllAppointments(providerId: string): Promise<Appointment[]>; // For getClients aggregation

  // Nearby / Search
  findNearby(params: { lat: number; lon: number; radiusKm: number; limit: number }): Promise<any[]>; // Returns raw rows or partial entities
  getServicesForProviders(providerIds: string[]): Promise<any[]>; // Aggregate services
  getRatingsForProviders(providerIds: string[]): Promise<any[]>; // Aggregate ratings

  // Public Profile
  findServiceStats(providerId: string): Promise<any[]>; // Aggregate service stats
}
