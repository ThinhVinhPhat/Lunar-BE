import { NestFactory } from '@nestjs/core';
import { WebhookModule } from './webhook.module';
import rawBodyMiddleware from '../../../libs/middleware/src/raw-body.middleware';

async function bootstrap() {
  const app = await NestFactory.create(WebhookModule);
  app.setGlobalPrefix('api/v1/webhook');
  const port = process.env.WEBHOOK_PORT || 3101;
  app.use(rawBodyMiddleware());

  await app.listen(port);
}
bootstrap();
