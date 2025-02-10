import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiIntegrationService } from './api-integration/api-integration.service';
import { JobOffer } from '../job-offers/entities/job-offer.entity';
import { Api2Adapter } from './adapters/api2.adapter';
import { Api1Adapter } from './adapters/api1.adapter';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer]), HttpModule],
  providers: [ApiIntegrationService, Api2Adapter, Api1Adapter],
  exports: [ApiIntegrationService],
})
export class ApiIntegrationModule {}
