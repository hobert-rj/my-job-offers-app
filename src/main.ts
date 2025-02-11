import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from 'src/setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupApp(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
