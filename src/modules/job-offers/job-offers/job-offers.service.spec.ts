import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { JobOfferRepositoryService } from '../job-offers.repository';
import { JobOfferQueryDto } from '../dto/job-offer.dto';

// We mock the retry helper so that we can control its behavior.
jest.mock('../../../shared/helpers/retry-with-exponential-backoff', () => ({
  retryWithExponentialBackoff: jest.fn(),
}));
import { retryWithExponentialBackoff } from '../../../shared/helpers/retry-with-exponential-backoff';

describe('JobOffersService', () => {
  let service: JobOffersService;
  let repositoryService: JobOfferRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOffersService,
        {
          provide: JobOfferRepositoryService,
          useValue: {
            getJobOffers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobOffersService>(JobOffersService);
    repositoryService = module.get<JobOfferRepositoryService>(JobOfferRepositoryService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return job offers on success', async () => {
    // Arrange
    const queryDto: JobOfferQueryDto = { title: 'Engineer', page: 1, limit: 10 };
    const fakeResult = { data: [{ id: 1, title: 'Software Engineer' }], total: 1 };

    // Simulate that retryWithExponentialBackoff calls the provided function.
    (retryWithExponentialBackoff as jest.Mock).mockImplementation(async (fn: Function) => {
      return await fn();
    });
    // Simulate repositoryService.getJobOffers returning fakeResult.
    (repositoryService.getJobOffers as jest.Mock).mockResolvedValue(fakeResult);

    // Act
    const result = await service.getJobOffers(queryDto);

    // Assert
    expect(result).toEqual(fakeResult);
    expect(repositoryService.getJobOffers).toHaveBeenCalledWith(queryDto);
  });

  it('should throw ServiceUnavailableException if retries fail', async () => {
    // Arrange
    const queryDto: JobOfferQueryDto = { title: 'Engineer', page: 1, limit: 10 };
    const error = new Error('Some error');

    // Simulate that retryWithExponentialBackoff rejects.
    (retryWithExponentialBackoff as jest.Mock).mockRejectedValue(error);

    // Act & Assert: The service should catch the error and throw a ServiceUnavailableException.
    await expect(service.getJobOffers(queryDto)).rejects.toThrow(ServiceUnavailableException);
  });
});
