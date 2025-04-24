import { NestFactory } from '@nestjs/core';
import { WebhookModule } from './webhook.module';

async function bootstrap() {
  const app = await NestFactory.create(WebhookModule);
  app.setGlobalPrefix('api/v1/webhook');
  await app.listen(3000);
}
bootstrap();
