import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';

export enum LanguageProficiency {
  BASIC = 'BASIC',
  CONVERSATIONAL = 'CONVERSATIONAL',
  FLUENT = 'FLUENT',
  NATIVE = 'NATIVE',
}

@Entity('provider_languages')
export class ProviderLanguage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProviderProfile, (provider) => provider.languages, { onDelete: 'CASCADE' })
  provider: ProviderProfile;

  @Column({ name: 'language_code', type: 'varchar', length: 10 })
  languageCode: string;

  @Column({ type: 'enum', enum: LanguageProficiency })
  proficiency: LanguageProficiency;
}