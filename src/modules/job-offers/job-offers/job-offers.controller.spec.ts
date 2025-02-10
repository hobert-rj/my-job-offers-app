import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { JobOffersController } from './job-offers.controller';
import { JobOffersService } from './job-offers.service';

describe('JobOffersController', () => {
  let controller: JobOffersController;
  let service: JobOffersService;

  // Create a simple mock for JobOffersService
  const mockJobOffersService = {
    getJobOffers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOffersController],
      providers: [
        { provide: JobOffersService, useValue: mockJobOffersService },
      ],
    }).compile();

    controller = module.get<JobOffersController>(JobOffersController);
    service = module.get<JobOffersService>(JobOffersService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getJobOffers', () => {
    it('should return a list of job offers with total when valid query is provided', async () => {
      // Arrange: Define a sample query and a fake response from the service.
      const queryDto = { title: 'Engineer', page: 1, limit: 10 };
      const fakeResult = {
        data: [
          {
            id: 1,
            title: 'Software Engineer',
            // ... other properties as needed
          },
        ],
        total: 1,
      };
      mockJobOffersService.getJobOffers.mockResolvedValue(fakeResult);

      // Act: Call the controller's getJobOffers method.
      const result = await controller.getJobOffers(queryDto);

      // Assert: Check that the result matches the fake result,
      // and that the service was called with the correct query DTO.
      expect(result).toEqual(fakeResult);
      expect(mockJobOffersService.getJobOffers).toHaveBeenCalledWith(queryDto);
    });

    it('should throw HttpException with status 500 when service throws an error', async () => {
      // Arrange: Define a sample query and simulate a service error.
      const queryDto = { title: 'Engineer', page: 1, limit: 10 };
      const serviceError = new Error('Service error');
      mockJobOffersService.getJobOffers.mockRejectedValue(serviceError);

      // Act & Assert: The controller should catch the error and throw an HttpException.
      await expect(controller.getJobOffers(queryDto)).rejects.toThrow(
        HttpException,
      );
      try {
        await controller.getJobOffers(queryDto);
      } catch (error) {
        // Check that the thrown exception has a 500 status.
        expect(error.getStatus()).toBe(500);
        expect(error.message).toEqual('Failed to retrieve job offers');
      }
    });
  });
});
