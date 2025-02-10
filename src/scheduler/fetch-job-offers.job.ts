import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiIntegrationService } from '../modules/api-integration/api-integration/api-integration.service';

@Injectable()
export class FetchJobOffersJob {
  private readonly logger = new Logger(FetchJobOffersJob.name);

  constructor(private readonly apiIntegrationService: ApiIntegrationService) {}

  /**
   * Cron job to fetch and process job offers from APIs.
   * The schedule can be configured via the JOB_FETCH_CRON environment variable.
   * Defaults to running every minute if not specified.
   */
  @Cron(process.env.JOB_FETCH_CRON || CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Cron job started: Fetching job offers from APIs.');
    try {
      await this.apiIntegrationService.processAllJobs();
      this.logger.log('Cron job completed successfully.');
    } catch (error) {
      this.logger.error(
        'Cron job failed: Error processing job offers',
        error.stack,
      );
    }
  }
}
