import { config } from '@app/config';
import { SharedModule } from '@app/shared';
import { StripeModule } from '@app/stripe';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    StripeModule.forRoot({
      secretKey: config.STRIPE.STRIPE_SERECT_KEY,
    }),
    SharedModule,
  ],
  controllers: [],
  providers: [],
})
export class WebhookModule {}
