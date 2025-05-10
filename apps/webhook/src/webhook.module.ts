import { config } from '@app/config';
import { SharedModule } from '@app/shared';
import { StripeModule } from '@app/stripe';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { StripeWebhookModule } from './domain/stripe/stripe.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    StripeModule.forRoot({
      secretKey: config.STRIPE.STRIPE_SERECT_KEY,
    }),
    SharedModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          username: config.get('REDIS_USERNAME'),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),
    StripeWebhookModule,
  ],
  exports: [BullModule],
})
export class WebhookModule {}
