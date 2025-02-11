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
import { JobOffersResponseDto } from '../dto/job-offers-response.dto';
import { plainToInstance } from 'class-transformer';
import { JobOfferOutputDto } from 'src/modules/job-offers/dto/job-offer-output.dto';

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
    type: JobOffersResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getJobOffers(
    @Query() queryDto: JobOfferQueryDto,
  ): Promise<JobOffersResponseDto> {
    try {
      // The service returns an object with "data" (array of JobOffer entities) and "total"
      const { data, total } =
        await this.jobOffersService.getJobOffers(queryDto);

      // Transform each JobOffer entity into JobOfferOutputDto
      const transformedData = plainToInstance(
        // This converts each element in the array:
        JobOfferOutputDto,
        data,
        { excludeExtraneousValues: true },
      );

      return { data: transformedData, total };
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to retrieve job offers', error: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
