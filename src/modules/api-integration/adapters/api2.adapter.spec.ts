import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { Api2Adapter } from './api2.adapter';
import { Provider2Response } from '../transformers/job-offer.transformer';

describe('Api2Adapter', () => {
  let api2Adapter: Api2Adapter;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Api2Adapter,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    api2Adapter = module.get<Api2Adapter>(Api2Adapter);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('fetchJobs', () => {
    it('should return Provider2Response data on success', async () => {
      // Arrange: Create a sample Provider2Response object.
      const mockResponse: Provider2Response = {
        status: 'success',
        data: {
          jobsList: {
            job1: {
              position: 'Software Engineer',
              location: {
                city: 'New York',
                state: 'NY',
                remote: false,
              },
              compensation: {
                min: 80000,
                max: 120000,
                currency: 'USD',
              },
              employer: {
                companyName: 'Tech Inc',
                website: 'https://techinc.com',
              },
              requirements: {
                experience: 3,
                technologies: ['Node.js', 'NestJS'],
              },
              datePosted: '2025-01-01T00:00:00.000Z',
            },
          },
        },
      };

      // Simulate a successful HTTP GET call returning an observable.
      (httpService.get as jest.Mock).mockReturnValue(
        of({ data: mockResponse }),
      );

      // Act: Call fetchJobs().
      const result = await api2Adapter.fetchJobs();

      // Assert: Verify that the returned data matches the sample,
      // and that the correct URL was used.
      expect(result).toEqual(mockResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://assignment.devotel.io/api/provider2/jobs',
      );
    });

    it('should throw an error and log an error when httpService.get fails', async () => {
      // Arrange: Create an error with a stack trace.
      const error = new Error('Network Error');
      error.stack = 'stack trace';

      // Simulate a failed HTTP GET call by returning an error observable.
      (httpService.get as jest.Mock).mockReturnValue(throwError(() => error));

      // Spy on the adapter's logger.error method.
      const loggerErrorSpy = jest
        .spyOn((api2Adapter as any).logger, 'error')
        .mockImplementation(() => {});

      // Act & Assert: Verify that fetchJobs() rejects with the expected error message.
      await expect(api2Adapter.fetchJobs()).rejects.toThrow(
        'Provider2 API call failed',
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error fetching jobs from Provider2',
        'stack trace',
      );

      // Clean up the spy.
      loggerErrorSpy.mockRestore();
    });
  });
});
