import { Module } from '@nestjs/common';
import { StripeWebhookService } from './stripe.service';
import { StripeWebhookController } from './stripe.controller';

@Module({
  imports: [],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService, ],
})
export class StripeWebhookModule {}
