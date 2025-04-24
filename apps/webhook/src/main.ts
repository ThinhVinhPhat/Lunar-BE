import { NestFactory } from '@nestjs/core';
import { WebhookModule } from './webhook.module';
import rawBodyMiddleware from './domain/middleware/raw-body.middleware';

async function bootstrap() {
  const app = await NestFactory.create(WebhookModule);
  app.setGlobalPrefix('api/v1/webhook');
  app.use(rawBodyMiddleware());

  await app.listen(3000);
}
bootstrap();
