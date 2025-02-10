import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';

// Import the module, entity, and DTO from your application
import { JobOffersModule } from 'src/modules/job-offers/job-offers.module';
import {
  CurrencyEnum,
  JobOffer,
  JobTypeEnum,
  ProviderType,
} from 'src/modules/job-offers/entities/job-offer.entity';

describe('JobOffersController (e2e)', () => {
  let app: INestApplication;
  let jobOfferRepository: Repository<JobOffer>;

  beforeAll(async () => {
    // Create a testing module overriding the database connection with PostgreSQL
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JobOffersModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          entities: [JobOffer],
          synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
          logging: false,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    // Get the repository for JobOffer
    jobOfferRepository = moduleFixture.get<Repository<JobOffer>>(
      getRepositoryToken(JobOffer),
    );

    // Clear the database table to avoid duplicate entries.
    await jobOfferRepository.clear();

    // Seed test data
    const seedData = [
      {
        provider: ProviderType.provider1,
        originalJobId: 'P1-001',
        title: 'Software Engineer',
        location: 'New York, NY',
        remote: false,
        jobType: JobTypeEnum.FULL_TIME,
        salaryMin: 70000,
        salaryMax: 120000,
        currency: CurrencyEnum.USD,
        companyName: 'TechCorp',
        companyIndustry: 'Technology',
        companyWebsite: 'https://techcorp.com',
        skills: ['JavaScript', 'Node.js'],
        postedDate: new Date('2025-02-10T05:25:50.190Z'),
      },
      {
        provider: ProviderType.provider2,
        originalJobId: 'P2-002',
        title: 'Data Scientist',
        location: 'San Francisco, CA',
        remote: true,
        jobType: null,
        salaryMin: 80000,
        salaryMax: 150000,
        currency: CurrencyEnum.USD,
        companyName: 'DataWorks',
        companyIndustry: 'Analytics',
        companyWebsite: 'https://dataworks.com',
        skills: ['Python', 'Machine Learning'],
        postedDate: new Date('2025-02-09T00:00:00.000Z'),
      },
      {
        provider: ProviderType.provider1,
        originalJobId: 'P1-003',
        title: 'Frontend Developer',
        location: 'Austin, TX',
        remote: false,
        jobType: JobTypeEnum.FULL_TIME,
        salaryMin: 60000,
        salaryMax: 100000,
        currency: CurrencyEnum.USD,
        companyName: 'WebStart',
        companyIndustry: 'Digital',
        companyWebsite: 'https://webstart.com',
        skills: ['React', 'CSS'],
        postedDate: new Date('2025-02-08T00:00:00.000Z'),
      },
    ];

    // Insert seed data into the database
    for (const offer of seedData) {
      await jobOfferRepository.save(offer);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/job-offers (GET) should return all job offers', async () => {
    const response = await request(app.getHttpServer()).get('/api/job-offers');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    // Expect 3 offers from our seed data.
    expect(response.body.total).toBe(3);
  });

  it('/api/job-offers (GET) should filter by title', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/job-offers')
      .query({ title: 'Data Scientist' });
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.data[0].title).toBe('Data Scientist');
  });

  it('/api/job-offers (GET) should filter by location', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/job-offers')
      .query({ location: 'Austin' });
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.data[0].location).toContain('Austin');
  });

  it('/api/job-offers (GET) should filter by salary range', async () => {
    // Query for offers with salaryMin >= 65000 and salaryMax <= 130000.
    // Only the Software Engineer offer should match.
    const response = await request(app.getHttpServer())
      .get('/api/job-offers')
      .query({ salaryMin: 65000, salaryMax: 130000 });
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.data[0].title).toBe('Software Engineer');
  });

  it('/api/job-offers (GET) should paginate results', async () => {
    // Request page 1 with a limit of 2 items per page.
    const responsePage1 = await request(app.getHttpServer())
      .get('/api/job-offers')
      .query({ limit: 2, page: 1 });
    expect(responsePage1.status).toBe(200);
    expect(responsePage1.body.data.length).toBe(2);
    expect(responsePage1.body.total).toBe(3);

    // Request page 2 which should return the remaining 1 item.
    const responsePage2 = await request(app.getHttpServer())
      .get('/api/job-offers')
      .query({ limit: 2, page: 2 });
    expect(responsePage2.status).toBe(200);
    expect(responsePage2.body.data.length).toBe(1);
  });

  it('/api/job-offers (GET) should return error for invalid query parameters', async () => {
    // Sending an invalid (non-numeric) value for salaryMin should trigger validation errors.
    const response = await request(app.getHttpServer())
      .get('/api/job-offers')
      .query({ salaryMin: 'invalid' });
    expect(response.status).toBe(400);
  });
});
