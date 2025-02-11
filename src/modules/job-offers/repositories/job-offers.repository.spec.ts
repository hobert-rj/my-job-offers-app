import { Test, TestingModule } from '@nestjs/testing';
import {
  CurrencyEnum,
  JobOffer,
  JobTypeEnum,
  ProviderType,
} from '../entities/job-offer.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobOfferRepository } from 'src/modules/job-offers/repositories/job-offers.repository';

describe('JobOfferRepositoryService', () => {
  let service: JobOfferRepository;
  let repository: Repository<JobOffer>;

  // Create a mock query builder that simulates the chainable methods
  const mockQueryBuilder: any = {
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  // Create a mock repository that returns the mock query builder when createQueryBuilder is called
  const mockRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOfferRepository,
        {
          provide: getRepositoryToken(JobOffer),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<JobOfferRepository>(JobOfferRepository);
    repository = module.get<Repository<JobOffer>>(getRepositoryToken(JobOffer));
  });

  afterEach(() => {
    // Clear mock call history between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return job offers with default pagination when no filters are provided', async () => {
    // Arrange: set up the expected result from getManyAndCount
    const expectedData: JobOffer[] = [
      {
        id: '1',
        provider: ProviderType.provider1,
        originalJobId: 'job1',
        title: 'Software Engineer',
        location: 'New York',
        remote: false,
        jobType: JobTypeEnum.FULL_TIME,
        salaryMin: 50000,
        salaryMax: 70000,
        currency: CurrencyEnum.USD,
        companyName: 'Acme Corp',
        companyIndustry: null,
        companyWebsite: null,
        skills: null,
        postedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const expectedTotal = 1;

    // The mock query builder should resolve with these values
    mockQueryBuilder.getManyAndCount.mockResolvedValue([
      expectedData,
      expectedTotal,
    ]);

    // Act: call the service method without any filter options
    const result = await service.getJobOffers({});

    // Assert
    expect(result).toEqual({ data: expectedData, total: expectedTotal });
    expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('job_offer');
    // Default pagination: page = 1, limit = 10 so skip = 0, take = 10
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
  });

  it('should apply the title filter correctly', async () => {
    // Arrange
    const expectedData: JobOffer[] = [];
    const expectedTotal = 0;
    mockQueryBuilder.getManyAndCount.mockResolvedValue([
      expectedData,
      expectedTotal,
    ]);
    const title = 'Developer';

    // Act
    await service.getJobOffers({ title });

    // Assert: verify that the title filter was applied as expected
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'job_offer.title ILIKE :title',
      { title: `%${title}%` },
    );
  });

  it('should apply the location filter correctly', async () => {
    // Arrange
    const expectedData: JobOffer[] = [];
    const expectedTotal = 0;
    mockQueryBuilder.getManyAndCount.mockResolvedValue([
      expectedData,
      expectedTotal,
    ]);
    const location = 'San Francisco';

    // Act
    await service.getJobOffers({ location });

    // Assert
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'job_offer.location ILIKE :location',
      { location: `%${location}%` },
    );
  });

  it('should apply the salaryMin filter correctly', async () => {
    // Arrange
    const expectedData: JobOffer[] = [];
    const expectedTotal = 0;
    mockQueryBuilder.getManyAndCount.mockResolvedValue([
      expectedData,
      expectedTotal,
    ]);
    const salaryMin = 60000;

    // Act
    await service.getJobOffers({ salaryMin });

    // Assert
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'job_offer.salaryMin >= :salaryMin',
      { salaryMin },
    );
  });

  it('should apply the salaryMax filter correctly', async () => {
    // Arrange
    const expectedData: JobOffer[] = [];
    const expectedTotal = 0;
    mockQueryBuilder.getManyAndCount.mockResolvedValue([
      expectedData,
      expectedTotal,
    ]);
    const salaryMax = 90000;

    // Act
    await service.getJobOffers({ salaryMax });

    // Assert
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'job_offer.salaryMax <= :salaryMax',
      { salaryMax },
    );
  });

  it('should apply pagination parameters correctly', async () => {
    // Arrange
    const expectedData: JobOffer[] = [];
    const expectedTotal = 0;
    mockQueryBuilder.getManyAndCount.mockResolvedValue([
      expectedData,
      expectedTotal,
    ]);
    const page = 3;
    const limit = 5;

    // Act
    await service.getJobOffers({ page, limit });

    // Assert: for page 3 with limit 5, skip should be (3 - 1) * 5 = 10
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(limit);
  });
});
