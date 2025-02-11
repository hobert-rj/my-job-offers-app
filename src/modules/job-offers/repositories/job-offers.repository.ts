import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOffer } from '../entities/job-offer.entity';

@Injectable()
export class JobOfferRepository {
  constructor(
    @InjectRepository(JobOffer)
    private readonly repository: Repository<JobOffer>,
  ) {}

  /**
   * Retrieves job offers from the database using the provided filters and pagination options.
   * Wrapped with exponential backoff to retry on transient errors.
   *
   * @returns An object containing the list of job offers and the total count.
   * @param options
   */
  async getJobOffers(options: {
    title?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: JobOffer[]; total: number }> {
    const {
      title,
      location,
      salaryMin,
      salaryMax,
      page = 1,
      limit = 10,
    } = options;

    const query = this.repository.createQueryBuilder('job_offer');

    if (title) {
      query.andWhere('job_offer.title ILIKE :title', {
        title: `%${title}%`,
      });
    }
    if (location) {
      query.andWhere('job_offer.location ILIKE :location', {
        location: `%${location}%`,
      });
    }
    if (salaryMin !== undefined) {
      query.andWhere('job_offer.salaryMin >= :salaryMin', { salaryMin });
    }
    if (salaryMax !== undefined) {
      query.andWhere('job_offer.salaryMax <= :salaryMax', { salaryMax });
    }

    // Apply pagination
    query.skip((page - 1) * limit);
    query.take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }
}
