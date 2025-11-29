import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';
import { User } from '../../users/entities/user.entity';

export enum VerificationDocumentType {
  ID_CARD = 'ID_CARD',
  PASSPORT = 'PASSPORT',
  BUSINESS_LICENSE = 'BUSINESS_LICENSE',
  CERTIFICATE = 'CERTIFICATE',
  OTHER = 'OTHER',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('verification_documents')
export class VerificationDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  provider: ProviderProfile;

  @Column({ name: 'document_type', type: 'enum', enum: VerificationDocumentType })
  documentType: VerificationDocumentType;

  // Sensitive field (consider encryption at service layer)
  @Column({ name: 'document_url', type: 'varchar', length: 1024 })
  documentUrl: string;

  @Column({ type: 'enum', enum: VerificationStatus })
  status: VerificationStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string | null;

  @Column({ name: 'uploaded_at', type: 'timestamptz' })
  uploadedAt: Date;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt?: Date | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  reviewedBy?: User | null;
}