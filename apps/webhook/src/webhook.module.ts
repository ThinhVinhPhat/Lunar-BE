import { config } from '@app/config';
import { SharedModule } from '@app/shared';
import { StripeModule } from '@app/stripe';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { StripeWebhookController } from './domain/stripe/stripe.controller';
import { StripeProcessor } from './domain/stripe/stripe.processor';
import { StripeWebhookModule } from './domain/stripe/stripe.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    StripeModule.forRoot({
      secretKey: config.STRIPE.STRIPE_SERECT_KEY,
    }),
    SharedModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          maxRetriesPerRequest: 30,
        },
      }),
    }),
    StripeWebhookModule,
  ],
  exports: [BullModule],
})
export class WebhookModule {}
