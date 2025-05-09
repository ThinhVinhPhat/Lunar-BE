import { config } from '@app/config';
import { SharedModule } from '@app/shared';
import { StripeModule } from '@app/stripe';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { StripeWebhookController } from './domain/stripe/stripe.controller';
import { StripeProcessor } from './domain/stripe/stripe.processor';

@Module({
  imports: [
    StripeModule.forRoot({
      secretKey: config.STRIPE.STRIPE_SERECT_KEY,
    }),
    SharedModule,
    BullModule.forRoot({
      redis: { host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT },
    }),
    BullModule.registerQueue({
      name: 'stripe-webhook',
    }),
  ],
  controllers: [StripeWebhookController],
  providers: [StripeProcessor],
  exports: [BullModule]
})
export class WebhookModule {}
