import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  CurrencyEnum,
  JobTypeEnum,
  ProviderType,
} from '../entities/job-offer.entity';

export class JobOfferOutputDto {
  @ApiProperty({ description: 'Unique identifier for the job offer' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Provider type', enum: ProviderType })
  @Expose()
  provider: ProviderType;

  @ApiProperty({ description: 'Original job ID from the provider' })
  @Expose()
  originalJobId: string;

  @ApiProperty({ description: 'Job title' })
  @Expose()
  title: string;

  @ApiProperty({ description: 'Location of the job', required: false })
  @Expose()
  location: string;

  @ApiProperty({ description: 'Remote work flag', required: false })
  @Expose()
  remote: boolean;

  @ApiProperty({ description: 'Job type', enum: JobTypeEnum, required: false })
  @Expose()
  jobType: JobTypeEnum;

  @ApiProperty({ description: 'Minimum salary', required: false })
  @Expose()
  salaryMin: number;

  @ApiProperty({ description: 'Maximum salary', required: false })
  @Expose()
  salaryMax: number;

  @ApiProperty({ description: 'Currency', enum: CurrencyEnum, required: false })
  @Expose()
  currency: CurrencyEnum;

  @ApiProperty({ description: 'Company name' })
  @Expose()
  companyName: string;

  @ApiProperty({ description: 'Company industry', required: false })
  @Expose()
  companyIndustry: string;

  @ApiProperty({ description: 'Company website', required: false })
  @Expose()
  companyWebsite: string;

  @ApiProperty({
    description: 'Skills required',
    isArray: true,
    required: false,
  })
  @Expose()
  skills: string[];

  @ApiProperty({ description: 'Date when the job was posted' })
  @Expose()
  postedDate: Date;

  @ApiProperty({ description: 'Record creation date' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Record last update date' })
  @Expose()
  updatedAt: Date;
}
