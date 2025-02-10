import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Provider1Response } from '../transformers/job-offer.transformer';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class Api1Adapter {
  private readonly logger = new Logger(Api1Adapter.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetches job offers from Provider1.
   * @returns A promise resolving to Provider1Response.
   */
  async fetchJobs(): Promise<Provider1Response> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<Provider1Response>(
          'https://assignment.devotel.io/api/provider1/jobs',
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching jobs from Provider1', error.stack);
      throw new Error('Provider1 API call failed');
    }
  }
}
