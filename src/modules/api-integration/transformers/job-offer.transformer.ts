import {
  ProviderType,
  JobTypeEnum,
  CurrencyEnum,
} from 'src/modules/job-offers/entities/job-offer.entity';
import { Logger } from '@nestjs/common';

const logger = new Logger('job-offer.transformer');

/* ======================================================================
   Provider1 API Response Interfaces
   ====================================================================== */

/**
 * Represents the overall Provider1 API response.
 */
export interface Provider1Response {
  metadata: {
    requestId: string;
    timestamp: string; // ISO formatted date-time string.
  };
  jobs: Provider1Job[];
}

/**
 * Represents a single job from Provider1.
 */
export interface Provider1Job {
  jobId: string;
  title: string;
  details: {
    location: string;
    type: string; // e.g., "Full-Time", "Part-Time", etc.
    salaryRange: string; // e.g., "$57k - $127k"
  };
  company: {
    name: string;
    industry: string;
  };
  skills: string[];
  postedDate: string; // ISO formatted date-time string.
}

/* ======================================================================
   Provider2 API Response Interfaces
   ====================================================================== */

/**
 * Represents the overall Provider2 API response.
 */
export interface Provider2Response {
  status: string; // e.g., "success"
  data: {
    jobsList: {
      [jobId: string]: Provider2Job;
    };
  };
}

/**
 * Represents a single job from Provider2.
 */
export interface Provider2Job {
  position: string;
  location: {
    city: string;
    state: string;
    remote: boolean;
  };
  compensation: {
    min: number;
    max: number;
    currency: string; // e.g., "USD"
  };
  employer: {
    companyName: string;
    website: string;
  };
  requirements: {
    experience: number;
    technologies: string[];
  };
  datePosted: string; // ISO formatted date string.
}

/* ======================================================================
   Helper Functions for Transformation
   ====================================================================== */

/**
 * Parses the salary range string from Provider1.
 * Expected format: "$57k - $127k"
 *
 * @param salaryRange The salary range string.
 * @returns An object with salaryMin and salaryMax as numbers (multiplied by 1000) or null if parsing fails.
 */
function parseSalaryRange(salaryRange: string): { salaryMin: number | null; salaryMax: number | null } {
  const regex = /\$([\d\.]+)k\s*-\s*\$([\d\.]+)k/;
  const match = salaryRange.match(regex);
  if (!match) {
    // Return nulls if the format does not match.
    return { salaryMin: null, salaryMax: null };
  }
  const salaryMin = parseFloat(match[1]) * 1000;
  const salaryMax = parseFloat(match[2]) * 1000;
  return { salaryMin, salaryMax };
}

/**
 * Maps a free‑form job type string to the JobTypeEnum.
 * If no match is found, defaults to JobTypeEnum.OTHER.
 *
 * @param jobTypeStr The job type string from the API.
 * @returns A value from JobTypeEnum.
 */
function mapJobType(jobTypeStr: string): JobTypeEnum | null {
  if (!jobTypeStr) return null;
  const normalized = jobTypeStr.trim().toLowerCase();
  switch (normalized) {
    case 'full-time':
      return JobTypeEnum.FULL_TIME;
    case 'part-time':
      return JobTypeEnum.PART_TIME;
    case 'contract':
      return JobTypeEnum.CONTRACT;
    case 'temporary':
      return JobTypeEnum.TEMPORARY;
    case 'internship':
      return JobTypeEnum.INTERNSHIP;
    default:
      logger.warn(`Unrecognized job type: ${jobTypeStr}`);
      return JobTypeEnum.OTHER;
  }
}

/**
 * Maps a currency string to the CurrencyEnum.
 *
 * @param currencyStr The currency string from the API.
 * @returns A value from CurrencyEnum or null if not recognized.
 */
function mapCurrency(currencyStr: string): CurrencyEnum | null {
  if (!currencyStr) return null;
  const normalized = currencyStr.trim().toUpperCase();
  switch (normalized) {
    case 'USD':
      return CurrencyEnum.USD;
    case 'EUR':
      return CurrencyEnum.EUR;
    case 'GBP':
      return CurrencyEnum.GBP;
    default:
      logger.warn(`Unrecognized currency: ${currencyStr}`);
      return CurrencyEnum.OTHER;
  }
}

/* ======================================================================
   Transformation Functions
   ====================================================================== */

/**
 * Transforms a job from Provider1 into the unified JobOffer format.
 *
 * @param job A single Provider1 job.
 * @returns A unified job object with properly converted enum values.
 *
 * @remarks
 * - Converts salaryRange into numeric values.
 * - Maps the job type to a JobTypeEnum.
 * - Provider1 does not supply a remote flag or currency, so these are set to null.
 */
export function transformProvider1Job(job: Provider1Job) {
  const { salaryMin, salaryMax } = parseSalaryRange(job.details.salaryRange);
  return {
    provider: ProviderType.provider1,
    originalJobId: job.jobId,
    title: job.title,
    location: job.details.location,
    remote: null, // Not provided by Provider1.
    jobType: mapJobType(job.details.type),
    salaryMin,
    salaryMax,
    currency: null, // Not provided by Provider1.
    companyName: job.company.name,
    companyIndustry: job.company.industry,
    companyWebsite: null, // Not provided by Provider1.
    skills: job.skills,
    postedDate: new Date(job.postedDate),
  };
}

/**
 * Transforms a job from Provider2 into the unified JobOffer format.
 *
 * @param jobId The original job ID key from Provider2.
 * @param job A single Provider2 job.
 * @returns A unified job object with properly converted enum values.
 *
 * @remarks
 * - Concatenates city and state to form the location.
 * - Maps the currency to a CurrencyEnum.
 * - Provider2 does not provide a job type, so it is set to null.
 */
export function transformProvider2Job(jobId: string, job: Provider2Job) {
  return {
    provider: ProviderType.provider2,
    originalJobId: jobId,
    title: job.position,
    location: `${job.location.city}, ${job.location.state}`,
    remote: job.location.remote,
    jobType: null, // Provider2 does not provide explicit job type information.
    salaryMin: job.compensation.min,
    salaryMax: job.compensation.max,
    currency: mapCurrency(job.compensation.currency),
    companyName: job.employer.companyName,
    companyIndustry: null, // Not provided by Provider2.
    companyWebsite: job.employer.website,
    skills: job.requirements.technologies,
    postedDate: new Date(job.datePosted),
  };
}
