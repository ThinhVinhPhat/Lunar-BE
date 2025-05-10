import { Module } from '@nestjs/common';
import { StripeWebhookService } from './stripe.service';
import { StripeWebhookController } from './stripe.controller';
import { OrderModule } from '@/domain/order/order.module';
import { StripeProcessor } from './stripe.processor';
import { PaymentModule } from '@/domain/payment/payment.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@app/entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'stripe-webhook',
    }),
    TypeOrmModule.forFeature([Payment]),
    OrderModule,
    PaymentModule,
    MailerModule,
  ],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService, StripeProcessor],
})
export class StripeWebhookModule {}
