import { config, validate } from '@app/config';
import { StripeModule } from '@app/stripe';
import { Module } from '@nestjs/common';
import { StripeWebhookModule } from './domain/stripe/stripe.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env', '.env.example'],
    }),
    StripeModule.forRoot({
      secretKey: config.STRIPE.STRIPE_SERECT_KEY,
    }),
    StripeWebhookModule,
  ],
  controllers: [],
  providers: [],
})
export class WebhookModule {}
