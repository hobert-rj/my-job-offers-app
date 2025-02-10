Below is an updated README file that reflects your project's structure and environment configuration details. In this version, unit tests are co‑located with their code files (instead of being in a separate folder), and the provided environment files and Docker Compose configuration are intended primarily for development (and can also be used in production with minimal changes), since explicit production support is not implemented.

---

```markdown
# My Job Offers App

My Job Offers App is a backend application built with NestJS and TypeScript that integrates with two external APIs to fetch job offer data in different formats. The application transforms the data into a unified structure, stores the transformed job offers in a PostgreSQL database via TypeORM, and exposes a REST API endpoint to retrieve and filter these offers. It also supports scheduled data fetching with a cron job and employs an exponential backoff strategy to retry operations on transient errors.

## Table of Contents

- [Features](#features)
- [Architecture & Design Patterns](#architecture--design-patterns)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Docker Configuration](#docker-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Data Transformation:**  
  Integrates with two external APIs and converts job offer data from different structures into a unified format using adapter and strategy patterns.
- **Database Storage:**  
  Persists transformed job offers in a PostgreSQL database with TypeORM while preventing duplicate entries via unique constraints.
- **REST API:**  
  Exposes a `/api/job-offers` endpoint that supports filtering (by title, location, salary range) and pagination.
- **Scheduled Data Fetching:**  
  Uses a cron job to periodically fetch and update job offers.
- **Exponential Backoff:**  
  Implements a retry helper with exponential backoff for handling transient errors.
- **Comprehensive Testing:**  
  Includes unit and integration tests (using Jest) that are co‑located with their code files (e.g., in the same folders as the code being tested).

## Architecture & Design Patterns

The project is built with a modular architecture in NestJS and leverages several design patterns:

- **Adapter Pattern:**  
  Each external API is encapsulated by its own adapter (e.g., `api1.adapter.ts`, `api2.adapter.ts`).
- **Strategy Pattern:**  
  Dedicated transformer functions (e.g., in `job-offer.transformer.ts`) convert API responses to a unified format.
- **Repository Pattern:**  
  Database operations are abstracted behind a repository service, decoupling data access from business logic.
- **Exponential Backoff:**  
  A helper function (`retry-with-exponential-backoff.ts`) is used to retry failed asynchronous operations with increasing delays.
- **Scheduled Tasks:**  
  A cron job periodically triggers the API integration service to fetch and update job offers.

## Folder Structure

```plaintext
my-job-offers-app/
├── src/
│   ├── app.module.ts                // Root module
│   ├── main.ts                      // Application entry point
│   ├── config/                      // Configuration files & environment settings
│   ├── modules/
│   │   ├── job-offers/              // Job Offers module
│   │   │   ├── dto/                 // Data Transfer Objects (e.g., job-offer.dto.ts)
│   │   │   ├── entities/            // Database entities (e.g., job-offer.entity.ts)
│   │   │   ├── job-offers.controller.ts   // REST API controller
│   │   │   ├── job-offers.service.ts        // Business logic and error handling
│   │   │   └── job-offers.repository.ts     // Repository (or repository service) abstraction
│   │   └── api-integration/         // External API integration module
│   │       ├── adapters/            // Adapters for external APIs
│   │       │   ├── api1.adapter.ts
│   │       │   └── api2.adapter.ts
│   │       ├── transformers/        // Transformation functions (job-offer.transformer.ts)
│   │       └── api-integration.service.ts   // Coordinates API calls, transformation, and storage
│   ├── scheduler/                   // Cron job for scheduled data fetching
│   └── shared/                      // Shared utilities (logger, retry helper, etc.)
├── test/                            // Integration tests (e.g., for API endpoints)
├── docker-compose.yml               // Docker Compose for development (and can be used in production)
├── docker-compose-test.yml          // Docker Compose for testing PostgreSQL
├── .env.example                     // Example environment configuration (copy to .env)
├── .env.test.example                // Example test environment configuration (copy to .env.test)
├── package.json                     // Project dependencies and scripts
└── README.md                        // Project documentation (this file)
```

> **Note:** Unit tests are co‑located with their code files (i.e., next to the code they test) rather than in a separate folder.

## Setup Instructions

### Prerequisites

- **Node.js** (v14 or later recommended)
- **npm** or **yarn**
- **Docker** (to run PostgreSQL via Docker Compose)
- **PostgreSQL** (if you choose to install locally)

### Installation

1. **Clone the repository:**

   ```bash
   git clone git@github.com:hobert-rj/my-job-offers-app.git
   cd my-job-offers-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

### Environment Configuration

1. **Copy Environment Files:**

   For development/production:
   ```bash
   cp .env.example .env
   ```
   For testing:
   ```bash
   cp .env.test.example .env.test
   ```

2. **Customize as Needed:**  
   Edit `.env` and `.env.test` to update values (such as database credentials). For example:

   ```dotenv
   # Application
   PORT=3000

   # Postgres Database Configuration
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=nest_user
   POSTGRES_PASSWORD=nest_pass
   POSTGRES_DB=nest_db

   # TypeORM Configuration
   TYPEORM_CONNECTION=postgres
   TYPEORM_HOST=localhost
   TYPEORM_PORT=5432
   TYPEORM_USERNAME=nest_user
   TYPEORM_PASSWORD=nest_pass
   TYPEORM_DATABASE=nest_db
   TYPEORM_ENTITIES=src/**/*.entity{.ts,.js}
   TYPEORM_SYNCHRONIZE=true

   # Cron Schedule for fetching job offers (e.g., every 5 minutes)
   JOB_FETCH_CRON=*/5 * * * *
   ```

### Docker Configuration

There are two Docker Compose files provided for PostgreSQL. These files are intended for development and testing, and they can also be used in production if needed.

#### Development/Production Database

- **docker-compose.yml**

  ```yaml
  version: '3'
  services:
    my-job-offers-app-db:
      image: postgres:17
      restart: always
      env_file:
        - .env
      ports:
        - "5432:5432"
      volumes:
        - postgres_data:/var/lib/postgresql/data

  volumes:
    postgres_data:
  ```

To start the database:
```bash
docker compose -f docker-compose.yml up -d
```

#### Test Database

- **docker-compose-test.yml**

  ```yaml
  version: '3'
  services:
    my-job-offers-app-test-db:
      image: postgres:17
      restart: always
      env_file:
        - .env.test
      ports:
        - "5432:5432"
      volumes:
        - postgres_data_test:/var/lib/postgresql/data

  volumes:
    postgres_data_test:
  ```

To start the test database:
```bash
docker compose -f docker-compose-test.yml up -d
```

## Running the Application

To run the application in development mode:

```bash
npm run start:dev
```

The app will run on the port specified in your `.env` file (default is 3000).

## API Documentation

When the application is running, open your browser and navigate to:

```
http://localhost:3000/api-docs
```

This URL loads the Swagger UI, which documents the available endpoints.

### Example Endpoint: `/api/job-offers`

- **Method:** GET
- **Description:** Retrieves job offers with optional filtering (by title, location, salary range) and supports pagination.
- **Query Parameters:**
    - `title` (string): Filter by job title.
    - `location` (string): Filter by location.
    - `salaryMin` (number): Minimum salary.
    - `salaryMax` (number): Maximum salary.
    - `page` (number): Page number (for pagination).
    - `limit` (number): Number of items per page.
- **Example Request:**

  ```
  GET /api/job-offers?title=Engineer&page=1&limit=10
  ```

- **Example Response:**

  ```json
  {
    "data": [
      {
        "id": 1,
        "title": "Software Engineer",
        "location": "New York, NY",
        "remote": false,
        "jobType": "Full-Time",
        "salaryMin": 70000,
        "salaryMax": 120000,
        "currency": "USD",
        "companyName": "TechCorp",
        "companyIndustry": "Technology",
        "companyWebsite": "https://techcorp.com",
        "skills": ["JavaScript", "Node.js"],
        "postedDate": "2025-02-10T05:25:50.190Z",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "total": 1
  }
  ```

## Testing

### Running All Tests

To run all unit and integration tests:

```bash
npm run test
```

> **Note:**  
> Unit tests are co‑located with their corresponding source files. Integration tests are located in the `test/` folder.

### Running End-to-End Tests

To run end-to-end tests:

```bash
npm run test:e2e
```

### Test Coverage

The project includes:
- **Unit Tests:** For services, controllers, and helpers (such as the retry helper).
- **Integration Tests:** For API endpoints, data transformation, and external API integration.

## Scripts

Key scripts defined in `package.json`:

- **Build the project:**
  ```bash
  npm run build
  ```
- **Start in development mode:**
  ```bash
  npm run start:dev
  ```
- **Run tests:**
  ```bash
  npm run test
  ```
- **Run end-to-end tests:**
  ```bash
  npm run test:e2e
  ```
- **Lint the code:**
  ```bash
  npm run lint
  ```
- **Format the code:**
  ```bash
  npm run format
  ```

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to your branch: `git push origin feature/my-new-feature`
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
```

---

### Final Note

- **Environment Files:**  
  Users should copy `.env.example` to `.env` and `.env.test.example` to `.env.test` and then customize these files as needed.
- **Docker Files:**  
  The provided `docker-compose.yml` and `docker-compose-test.yml` files are intended for development (and may also be used in production) since explicit production support is not implemented.
- **Tests:**  
  Unit tests are located alongside their code files, while integration tests reside in the `test/` folder.

This README provides a comprehensive overview and instructions to get started with your project. Customize further as needed for your specific project details and requirements.
