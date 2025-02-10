import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JobOfferQueryDto } from '../dto/job-offer.dto';
import { JobOffer } from '../entities/job-offer.entity';

@ApiTags('Job Offers')
@Controller('api/job-offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  /**
   * Retrieves job offers with optional filtering by title, location, and salary range.
   * Supports pagination.
   *
   * @param queryDto Query parameters for filtering and pagination.
   * @returns A list of job offers along with the total count.
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve job offers with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of job offers retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getJobOffers(
    @Query() queryDto: JobOfferQueryDto,
  ): Promise<{ data: JobOffer[]; total: number }> {
    try {
      return await this.jobOffersService.getJobOffers(queryDto);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to retrieve job offers', error: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
