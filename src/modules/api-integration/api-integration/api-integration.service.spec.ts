import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApiIntegrationService } from './api-integration.service';
import { Api1Adapter } from '../adapters/api1.adapter';
import { Api2Adapter } from '../adapters/api2.adapter';
import {
  JobOffer,
  ProviderType,
} from '../../job-offers/entities/job-offer.entity';

// Note: The transformation functions are imported and used within the service,
// so we don't need to call them explicitly in the tests.

describe('ApiIntegrationService', () => {
  let service: ApiIntegrationService;
  let api1Adapter: Api1Adapter;
  let api2Adapter: Api2Adapter;
  let jobOfferRepository: Repository<JobOffer>;

  // Fake Provider1 response mimicking an external API response
  const fakeProvider1Response = {
    metadata: {
      requestId: 'req-123',
      timestamp: new Date().toISOString(),
    },
    jobs: [
      {
        jobId: 'P1-001',
        title: 'Software Engineer',
        details: {
          location: 'New York, NY',
          type: 'Full-Time', // Should be mapped to the corresponding enum
          salaryRange: '$57k - $127k', // Expected to parse into numeric values
        },
        company: {
          name: 'TechCorp',
          industry: 'Technology',
        },
        skills: ['JavaScript', 'Node.js'],
        postedDate: '2025-02-10T05:25:50.190Z',
      },
    ],
  };

  // Fake Provider2 response mimicking an external API response
  const fakeProvider2Response = {
    status: 'success',
    data: {
      jobsList: {
        'P2-002': {
          position: 'Data Scientist',
          location: { city: 'San Francisco', state: 'CA', remote: true },
          compensation: { min: 80000, max: 150000, currency: 'USD' },
          employer: {
            companyName: 'DataWorks',
            website: 'https://dataworks.com',
          },
          requirements: {
            experience: 2,
            technologies: ['Python', 'Machine Learning'],
          },
          datePosted: '2025-02-09',
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiIntegrationService,
        {
          provide: Api1Adapter,
          useValue: { fetchJobs: jest.fn() },
        },
        {
          provide: Api2Adapter,
          useValue: { fetchJobs: jest.fn() },
        },
        {
          provide: getRepositoryToken(JobOffer),
          useValue: { save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ApiIntegrationService>(ApiIntegrationService);
    api1Adapter = module.get<Api1Adapter>(Api1Adapter);
    api2Adapter = module.get<Api2Adapter>(Api2Adapter);
    jobOfferRepository = module.get<Repository<JobOffer>>(
      getRepositoryToken(JobOffer),
    );
  });

  describe('processProvider1Jobs', () => {
    it('should fetch jobs from Provider1, transform them, and save them', async () => {
      // Arrange: simulate a successful response from Provider1
      (api1Adapter.fetchJobs as jest.Mock).mockResolvedValue(
        fakeProvider1Response,
      );

      // Act: process Provider1 jobs
      await service.processProvider1Jobs();

      // Assert: ensure repository.save is called once per job in the response
      expect(jobOfferRepository.save).toHaveBeenCalledTimes(
        fakeProvider1Response.jobs.length,
      );

      // Verify one transformed job – the provider field should be set correctly.
      const savedJob = (jobOfferRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedJob.provider).toBe(ProviderType.provider1);
      expect(savedJob.originalJobId).toBe('P1-001');
      expect(savedJob.title).toBe('Software Engineer');
      // Additional assertions (such as salary values and company details) can be added as needed.
    });
  });

  describe('processProvider2Jobs', () => {
    it('should fetch jobs from Provider2, transform them, and save them', async () => {
      // Arrange: simulate a successful response from Provider2
      (api2Adapter.fetchJobs as jest.Mock).mockResolvedValue(
        fakeProvider2Response,
      );

      // Act: process Provider2 jobs
      await service.processProvider2Jobs();

      // Assert: ensure repository.save is called for each job in jobsList
      const numJobs = Object.keys(fakeProvider2Response.data.jobsList).length;
      expect(jobOfferRepository.save).toHaveBeenCalledTimes(numJobs);

      // Verify the transformed job.
      const savedJob = (jobOfferRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedJob.provider).toBe(ProviderType.provider2);
      expect(savedJob.originalJobId).toBe('P2-002');
      expect(savedJob.title).toBe('Data Scientist');
      // You may also assert that other fields (such as location and salary values) are transformed correctly.
    });
  });

  describe('processAllJobs', () => {
    it('should process both Provider1 and Provider2 jobs concurrently', async () => {
      // Arrange: simulate responses from both providers
      (api1Adapter.fetchJobs as jest.Mock).mockResolvedValue(
        fakeProvider1Response,
      );
      (api2Adapter.fetchJobs as jest.Mock).mockResolvedValue(
        fakeProvider2Response,
      );

      // Act: process all jobs concurrently
      await service.processAllJobs();

      // Assert: total save calls should equal the number of jobs from both providers
      const totalJobs =
        fakeProvider1Response.jobs.length +
        Object.keys(fakeProvider2Response.data.jobsList).length;
      expect(jobOfferRepository.save).toHaveBeenCalledTimes(totalJobs);
    });
  });
});
