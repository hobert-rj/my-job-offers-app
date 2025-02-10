import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

/**
 * Enum for the external API providers.
 */
export enum ProviderType {
  provider1 = 'provider1',
  provider2 = 'provider2',
}

/**
 * Enum for supported job types.
 * Add or adjust values as needed.
 */
export enum JobTypeEnum {
  FULL_TIME = 'Full-Time',
  PART_TIME = 'Part-Time',
  CONTRACT = 'Contract',
  TEMPORARY = 'Temporary',
  INTERNSHIP = 'Internship',
  OTHER = 'Other',
}

/**
 * Enum for supported currency codes.
 * Add additional currency codes as required.
 */
export enum CurrencyEnum {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  OTHER = 'Other',
  // Extend with other currencies as needed.
}

/**
 * Unified JobOffer entity.
 *
 * This model stores transformed job data from multiple external APIs.
 * Indexes have been added on columns used for filtering (e.g., title, location, salary ranges, and postedDate)
 * to optimize query performance.
 *
 * Duplicate records are prevented by enforcing a unique constraint on the provider and the originalJobId.
 */
@Entity('job_offers')
@Unique(['provider', 'originalJobId'])
export class JobOffer {
  // Unique identifier generated as a BIGINT identity column.
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    type: 'bigint',
  })
  id: string;

  // Indicates which provider supplied the job (e.g., provider1 or provider2).
  @Column({ type: 'enum', enum: ProviderType })
  provider: ProviderType;

  // The original job ID provided by the external API.
  @Column({ type: 'varchar', length: 100 })
  originalJobId: string;

  // Unified job title. Indexed for text-based filtering.
  @Index()
  @Column({ type: 'text' })
  title: string;

  // Unified location string (e.g., "New York, NY"). Using 'text' for flexibility and indexed for filtering.
  @Index()
  @Column({ type: 'text', nullable: true })
  location: string | null;

  // Optional flag indicating if the job can be done remotely.
  @Column({ type: 'boolean', nullable: true })
  remote: boolean | null;

  // Job type (e.g., Full-Time, Part-Time, etc.). Uses enum for a limited set of values.
  @Column({ type: 'enum', enum: JobTypeEnum, nullable: true })
  jobType: JobTypeEnum | null;

  // Minimum salary value (if available). Indexed to support range queries.
  @Index()
  @Column({ type: 'integer', nullable: true })
  salaryMin: number | null;

  // Maximum salary value (if available). Indexed to support range queries.
  @Index()
  @Column({ type: 'integer', nullable: true })
  salaryMax: number | null;

  // Currency code (e.g., USD, EUR, etc.). Uses enum for a limited set of values.
  @Column({ type: 'enum', enum: CurrencyEnum, nullable: true })
  currency: CurrencyEnum | null;

  // Name of the company offering the job.
  @Column({ type: 'text' })
  companyName: string;

  // Industry of the company. This field is optional.
  @Column({ type: 'text', nullable: true })
  companyIndustry: string | null;

  // Company website URL. This field is optional.
  @Column({ type: 'text', nullable: true })
  companyWebsite: string | null;

  // List of skills/technologies required for the job.
  // Stored as a comma‑separated list using TypeORM's simple-array type.
  @Column({ type: 'simple-array', nullable: true })
  skills: string[] | null;

  // Date when the job was posted. Indexed for filtering and sorting.
  @Index()
  @Column({ type: 'timestamp with time zone' })
  postedDate: Date;

  // Timestamps for record creation and updates.
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
