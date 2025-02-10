import {
  transformProvider1Job,
  transformProvider2Job,
} from 'src/modules/api-integration/transformers/job-offer.transformer';
import {
  CurrencyEnum,
  JobTypeEnum,
  ProviderType,
} from 'src/modules/job-offers/entities/job-offer.entity';

describe('API Integration - Transformation', () => {
  describe('Provider1 Transformation', () => {
    it('should correctly transform Provider1 job data into the unified format', () => {
      // Sample Provider1 job response object
      const provider1Job = {
        jobId: 'P1-266',
        title: 'Software Engineer',
        details: {
          location: 'New York, NY',
          type: 'Full-Time', // free‑form string expected to map to JobTypeEnum.FULL_TIME
          salaryRange: '$57k - $127k', // should be parsed into numbers (57000 and 127000)
        },
        company: {
          name: 'BackEnd Solutions',
          industry: 'Solutions',
        },
        skills: ['Java', 'Spring Boot', 'AWS'],
        postedDate: '2025-02-10T05:25:50.190Z', // ISO string
      };

      // Transform the Provider1 job data
      const transformed = transformProvider1Job(provider1Job);

      // Assert the unified object fields
      expect(transformed.provider).toBe(ProviderType.provider1);
      expect(transformed.originalJobId).toBe('P1-266');
      expect(transformed.title).toBe('Software Engineer');
      expect(transformed.location).toBe('New York, NY');
      // Provider1 does not provide a remote flag or currency; set as null
      expect(transformed.remote).toBeNull();
      expect(transformed.currency).toBeNull();
      // Verify jobType mapping via our helper (assumed mapping: 'Full-Time' → JobTypeEnum.FULL_TIME)
      expect(transformed.jobType).toBe(JobTypeEnum.FULL_TIME);
      // Salary values: parse "$57k - $127k" → 57000 and 127000
      expect(transformed.salaryMin).toBe(57000);
      expect(transformed.salaryMax).toBe(127000);
      expect(transformed.companyName).toBe('BackEnd Solutions');
      expect(transformed.companyIndustry).toBe('Solutions');
      // Provider1 does not supply a company website; expect null
      expect(transformed.companyWebsite).toBeNull();
      expect(transformed.skills).toEqual(['Java', 'Spring Boot', 'AWS']);
      // Check that the postedDate converts correctly to a Date
      expect(new Date(transformed.postedDate).toISOString()).toBe(
        '2025-02-10T05:25:50.190Z',
      );
    });
  });

  describe('Provider2 Transformation', () => {
    it('should correctly transform Provider2 job data into the unified format', () => {
      // Sample Provider2 job response object
      const provider2Job = {
        position: 'Data Scientist',
        location: { city: 'Seattle', state: 'WA', remote: true },
        compensation: { min: 60000, max: 105000, currency: 'USD' }, // currency should map to CurrencyEnum.USD
        employer: {
          companyName: 'BackEnd Solutions',
          website: 'https://dataworks.com',
        },
        requirements: {
          experience: 1,
          technologies: ['HTML', 'CSS', 'Vue.js'],
        },
        datePosted: '2025-02-09', // date string (ISO date without time)
      };

      const jobId = 'job-897';

      // Transform the Provider2 job data
      const transformed = transformProvider2Job(jobId, provider2Job);

      // Assert the unified object fields
      expect(transformed.provider).toBe(ProviderType.provider2);
      expect(transformed.originalJobId).toBe(jobId);
      expect(transformed.title).toBe('Data Scientist');
      // Concatenation of city and state
      expect(transformed.location).toBe('Seattle, WA');
      expect(transformed.remote).toBe(true);
      // Provider2 does not provide jobType; expect null
      expect(transformed.jobType).toBeNull();
      expect(transformed.salaryMin).toBe(60000);
      expect(transformed.salaryMax).toBe(105000);
      // Currency string "USD" should map to CurrencyEnum.USD
      expect(transformed.currency).toBe(CurrencyEnum.USD);
      expect(transformed.companyName).toBe('BackEnd Solutions');
      // Provider2 does not provide company industry information; expect null
      expect(transformed.companyIndustry).toBeNull();
      expect(transformed.companyWebsite).toBe('https://dataworks.com');
      expect(transformed.skills).toEqual(['HTML', 'CSS', 'Vue.js']);
      // The datePosted string should be converted to a Date object.
      // We compare only the date portion (ISO string date format)
      expect(new Date(transformed.postedDate).toISOString().slice(0, 10)).toBe(
        '2025-02-09',
      );
    });
  });
});
