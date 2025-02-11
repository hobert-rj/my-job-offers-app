import { Logger } from '@nestjs/common';
import {
  CurrencyEnum,
  JobTypeEnum,
  ProviderType,
} from 'src/modules/job-offers/entities/job-offer.entity';
import {
  transformProvider1Job,
  transformProvider2Job,
} from 'src/modules/api-integration/transformers/job-offer.transformer';

describe('Job Offer Transformer', () => {
  describe('transformProvider1Job', () => {
    it('should transform a valid Provider1 job', () => {
      const provider1Job = {
        jobId: 'job1',
        title: 'Software Developer',
        details: {
          location: 'New York',
          type: 'Full-Time',
          salaryRange: '$50k - $100k',
        },
        company: {
          name: 'Tech Corp',
          industry: 'Technology',
        },
        skills: ['JavaScript', 'TypeScript'],
        postedDate: '2025-01-01T00:00:00.000Z',
      };

      const result = transformProvider1Job(provider1Job);

      expect(result).toEqual({
        provider: ProviderType.provider1,
        originalJobId: 'job1',
        title: 'Software Developer',
        location: 'New York',
        remote: null, // Not provided by Provider1
        jobType: JobTypeEnum.FULL_TIME,
        salaryMin: 50000,
        salaryMax: 100000,
        currency: null, // Not provided by Provider1
        companyName: 'Tech Corp',
        companyIndustry: 'Technology',
        companyWebsite: null, // Not provided by Provider1
        skills: ['JavaScript', 'TypeScript'],
        postedDate: new Date('2025-01-01T00:00:00.000Z'),
      });
    });

    it('should return null salary values when salaryRange is invalid', () => {
      const provider1Job = {
        jobId: 'job2',
        title: 'Data Analyst',
        details: {
          location: 'San Francisco',
          type: 'Internship',
          salaryRange: 'invalid salary range',
        },
        company: {
          name: 'Data Inc',
          industry: 'Analytics',
        },
        skills: ['SQL', 'Python'],
        postedDate: '2025-01-02T00:00:00.000Z',
      };

      const result = transformProvider1Job(provider1Job);

      expect(result.salaryMin).toBeNull();
      expect(result.salaryMax).toBeNull();
    });

    it('should map unrecognized job type to OTHER and log a warning', () => {
      // Spy on Logger.prototype.warn to catch the warning
      const warnSpy = jest
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => {});

      const provider1Job = {
        jobId: 'job3',
        title: 'Freelancer',
        details: {
          location: 'Remote',
          type: 'Gig', // unrecognized type
          salaryRange: '$30k - $60k',
        },
        company: {
          name: 'Freelance Inc',
          industry: 'Consulting',
        },
        skills: ['Communication'],
        postedDate: '2025-01-03T00:00:00.000Z',
      };

      const result = transformProvider1Job(provider1Job);

      expect(result.jobType).toBe(JobTypeEnum.OTHER);
      expect(warnSpy).toHaveBeenCalledWith(`Unrecognized job type: Gig`);

      // Restore the original implementation
      warnSpy.mockRestore();
    });
  });

  describe('transformProvider2Job', () => {
    it('should transform a valid Provider2 job', () => {
      const provider2Job = {
        position: 'Frontend Engineer',
        location: {
          city: 'Los Angeles',
          state: 'CA',
          remote: true,
        },
        compensation: {
          min: 70000,
          max: 120000,
          currency: 'usd', // lowercase input
        },
        employer: {
          companyName: 'Design Studio',
          website: 'https://designstudio.com',
        },
        requirements: {
          experience: 3,
          technologies: ['React', 'CSS'],
        },
        datePosted: '2025-01-03',
      };

      const jobId = 'job4';

      const result = transformProvider2Job(jobId, provider2Job);

      expect(result).toEqual({
        provider: ProviderType.provider2,
        originalJobId: jobId,
        title: 'Frontend Engineer',
        location: 'Los Angeles, CA',
        remote: true,
        jobType: null, // Provider2 does not supply job type
        salaryMin: 70000,
        salaryMax: 120000,
        currency: CurrencyEnum.USD,
        companyName: 'Design Studio',
        companyIndustry: null, // Not provided by Provider2
        companyWebsite: 'https://designstudio.com',
        skills: ['React', 'CSS'],
        postedDate: new Date('2025-01-03'),
      });
    });

    it('should map unrecognized currency to OTHER and log a warning', () => {
      // Spy on Logger.prototype.warn to catch the warning
      const warnSpy = jest
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => {});

      const provider2Job = {
        position: 'Backend Engineer',
        location: {
          city: 'Chicago',
          state: 'IL',
          remote: false,
        },
        compensation: {
          min: 80000,
          max: 130000,
          currency: 'abc', // unrecognized currency
        },
        employer: {
          companyName: 'Backend Co',
          website: 'https://backendco.com',
        },
        requirements: {
          experience: 5,
          technologies: ['Node.js', 'Express'],
        },
        datePosted: '2025-01-04',
      };

      const jobId = 'job5';

      const result = transformProvider2Job(jobId, provider2Job);

      expect(result.currency).toBe(CurrencyEnum.OTHER);
      expect(warnSpy).toHaveBeenCalledWith(`Unrecognized currency: abc`);

      // Restore the original implementation
      warnSpy.mockRestore();
    });
  });
});
