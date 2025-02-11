import { Module } from '@nestjs/common';
import { JobOffersController } from './job-offers/job-offers.controller';
import { JobOffersService } from './job-offers/job-offers.service';
import { JobOffer } from './entities/job-offer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOfferRepository } from 'src/modules/job-offers/repositories/job-offers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer])],
  controllers: [JobOffersController],
  providers: [JobOffersService, JobOfferRepository],
  exports: [JobOffersService],
})
export class JobOffersModule {}
