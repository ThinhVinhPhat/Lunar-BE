import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApiServer } from 'libs/setup/setup-api-server';
import { config } from '@app/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  await setupApiServer({
    app,
    appConfig: {
      appName: config.app.name,
      appPort: config.app.port,
      globalPrefix: 'api/v1',
    },
    swaggerConfig: {
      title: 'Glasses Store API',
      description: 'API documentation for Glasses Store',
      version: '1.0',
    },
  });
}
bootstrap();
