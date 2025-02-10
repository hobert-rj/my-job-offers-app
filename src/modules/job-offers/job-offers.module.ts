import { Module } from '@nestjs/common';
import { JobOffersController } from './job-offers/job-offers.controller';
import { JobOffersService } from './job-offers/job-offers.service';
import { JobOffer } from './entities/job-offer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOfferRepositoryService } from './job-offers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer])],
  controllers: [JobOffersController],
  providers: [JobOffersService, JobOfferRepositoryService],
  exports: [JobOffersService],
})
export class JobOffersModule {}
