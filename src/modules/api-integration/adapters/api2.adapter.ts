import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Provider2Response } from '../transformers/job-offer.transformer';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class Api2Adapter {
  private readonly logger = new Logger(Api2Adapter.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetches job offers from Provider2.
   * @returns A promise resolving to Provider2Response.
   */
  async fetchJobs(): Promise<Provider2Response> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<Provider2Response>(
          'https://assignment.devotel.io/api/provider2/jobs',
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching jobs from Provider2', error.stack);
      throw new Error('Provider2 API call failed');
    }
  }
}
