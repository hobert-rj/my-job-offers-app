import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Reflector } from '@nestjs/core';

/**
 * Configures global settings for the Nest application.
 * - Sets up Swagger for API documentation.
 * - Applies a global ValidationPipe with transformation and whitelisting.
 * - Applies a global ClassSerializerInterceptor for fine-grained output using @Expose.
 *
 * @param app - The Nest application instance.
 * @returns The configured Nest application.
 */
export function setupApp(app: INestApplication): INestApplication {
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Job Offers API')
    .setDescription(
      'API for retrieving transformed job offers with filtering and pagination.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Global validation pipe configuration
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global interceptor for class serialization with fine‑grained @Expose support
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
    }),
  );

  return app;
}
