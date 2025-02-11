import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { Api1Adapter } from './api1.adapter';
import { Provider1Response } from '../transformers/job-offer.transformer';

describe('Api1Adapter', () => {
  let api1Adapter: Api1Adapter;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Api1Adapter,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    api1Adapter = module.get<Api1Adapter>(Api1Adapter);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('fetchJobs', () => {
    it('should return Provider1Response data on success', async () => {
      // Arrange: Prepare a sample Provider1Response object
      const mockResponse: Provider1Response = {
        metadata: {
          requestId: 'req-123',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
        jobs: [
          {
            jobId: 'job1',
            title: 'Software Developer',
            details: {
              location: 'San Francisco',
              type: 'Full-Time',
              salaryRange: '$50k - $100k',
            },
            company: {
              name: 'Tech Company',
              industry: 'Software',
            },
            skills: ['JavaScript', 'TypeScript'],
            postedDate: '2025-01-01T00:00:00.000Z',
          },
        ],
      };

      // Simulate a successful HTTP GET call returning an observable
      (httpService.get as jest.Mock).mockReturnValue(
        of({ data: mockResponse }),
      );

      // Act: Call fetchJobs()
      const result = await api1Adapter.fetchJobs();

      // Assert: Verify the returned data and the called URL
      expect(result).toEqual(mockResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://assignment.devotel.io/api/provider1/jobs',
      );
    });

    it('should throw an error and log an error when httpService.get fails', async () => {
      // Arrange: Prepare an error with a stack trace
      const error = new Error('Network Error');
      error.stack = 'stack trace';

      // Simulate a failed HTTP GET call by returning an error observable
      (httpService.get as jest.Mock).mockReturnValue(throwError(() => error));

      // Spy on the logger.error method from the adapter's logger instance
      const loggerErrorSpy = jest
        .spyOn((api1Adapter as any).logger, 'error')
        .mockImplementation(() => {});

      // Act & Assert: The fetchJobs call should reject with a specific error message
      await expect(api1Adapter.fetchJobs()).rejects.toThrow(
        'Provider1 API call failed',
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error fetching jobs from Provider1',
        'stack trace',
      );

      // Clean up the spy
      loggerErrorSpy.mockRestore();
    });
  });
});
