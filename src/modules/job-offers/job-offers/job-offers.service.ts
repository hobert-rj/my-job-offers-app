import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JobOffer } from '../entities/job-offer.entity';
import { JobOfferQueryDto } from '../dto/job-offer.dto';
import { JobOfferRepositoryService } from '../job-offers.repository';
import { retryWithExponentialBackoff } from 'src/shared/helpers/retry-with-exponential-backoff';

@Injectable()
export class JobOffersService {
  private readonly logger = new Logger(JobOffersService.name);

  constructor(
    private readonly jobOfferRepositoryService: JobOfferRepositoryService,
  ) {}

  /**
   * Retrieves job offers from the database using the provided filters and pagination options.
   * Wrapped with exponential backoff to retry on transient errors.
   *
   * @param queryDto Filter and pagination parameters.
   * @returns An object containing the list of job offers and the total count.
   */
  async getJobOffers(
    queryDto: JobOfferQueryDto,
  ): Promise<{ data: JobOffer[]; total: number }> {
    try {
      return await retryWithExponentialBackoff(async () =>
        this.jobOfferRepositoryService.getJobOffers(queryDto),
      );
    } catch (error) {
      this.logger.error(`Operation failed after retries: ${error.message}`);
      throw new ServiceUnavailableException();
    }
  }
}
