import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { JobOfferOutputDto } from './job-offer-output.dto';

export class JobOffersResponseDto {
  @ApiProperty({
    description: 'Array of job offers',
    type: [JobOfferOutputDto],
  })
  @Expose()
  @Type(() => JobOfferOutputDto)
  data: JobOfferOutputDto[];

  @ApiProperty({ description: 'Total number of job offers', example: 100 })
  @Expose()
  total: number;
}
