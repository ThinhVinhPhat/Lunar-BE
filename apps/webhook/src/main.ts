import { NestFactory } from '@nestjs/core';
import { WebhookModule } from './webhook.module';
import rawBodyMiddleware from '../../../libs/middleware/src/raw-body.middleware';
import { GlobalExceptionFilter } from '@app/filter';

async function bootstrap() {
  const app = await NestFactory.create(WebhookModule);
  app.setGlobalPrefix('api/v1/webhook');
  const port = process.env.WEBHOOK_PORT || 3101;
  app.use(rawBodyMiddleware());
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(port);
}
bootstrap();
