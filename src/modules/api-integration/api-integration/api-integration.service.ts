import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Api1Adapter } from '../adapters/api1.adapter';
import { Api2Adapter } from '../adapters/api2.adapter';
import { JobOffer } from '../../job-offers/entities/job-offer.entity';
import {
  transformProvider1Job,
  transformProvider2Job,
} from '../transformers/job-offer.transformer';

@Injectable()
export class ApiIntegrationService {
  private readonly logger = new Logger(ApiIntegrationService.name);

  constructor(
    private readonly api1Adapter: Api1Adapter,
    private readonly api2Adapter: Api2Adapter,
    @InjectRepository(JobOffer)
    private readonly jobOfferRepository: Repository<JobOffer>,
  ) {}

  /**
   * Processes jobs from Provider1:
   * - Fetches jobs via the adapter.
   * - Transforms each job.
   * - Saves each transformed job, relying on the DB’s unique constraint to avoid duplicates.
   */
  async processProvider1Jobs(): Promise<void> {
    try {
      const provider1Response = await this.api1Adapter.fetchJobs();
      for (const job of provider1Response.jobs) {
        const transformedJob = transformProvider1Job(job);
        await this.saveJobOffer(transformedJob);
      }
    } catch (error) {
      this.logger.error('Error processing Provider1 jobs', error.stack);
    }
  }

  /**
   * Processes jobs from Provider2:
   * - Fetches jobs via the adapter.
   * - Transforms each job.
   * - Saves each transformed job.
   */
  async processProvider2Jobs(): Promise<void> {
    try {
      const provider2Response = await this.api2Adapter.fetchJobs();
      const jobsList = provider2Response.data.jobsList;
      for (const jobId in jobsList) {
        const transformedJob = transformProvider2Job(jobId, jobsList[jobId]);
        await this.saveJobOffer(transformedJob);
      }
    } catch (error) {
      this.logger.error('Error processing Provider2 jobs', error.stack);
    }
  }

  /**
   * Processes all providers concurrently.
   */
  async processAllJobs(): Promise<void> {
    await Promise.all([
      this.processProvider1Jobs(),
      this.processProvider2Jobs(),
    ]);
  }

  /**
   * Saves the transformed job offer to the database.
   * Duplicate entries (by provider and originalJobId) are prevented by the DB unique constraint.
   * @param jobOffer A transformed job offer object.
   */
  private async saveJobOffer(jobOffer: Partial<JobOffer>): Promise<void> {
    try {
      await this.jobOfferRepository.save(jobOffer);
    } catch (error) {
      // PostgreSQL unique violation error code: '23505'
      if (error.code === '23505') {
        this.logger.warn(
          `Duplicate job: ${jobOffer.provider} ${jobOffer.originalJobId} - skipping.`,
        );
      } else {
        this.logger.error(
          'Error saving job offer to the database',
          error.stack,
        );
        throw error;
      }
    }
  }
}
