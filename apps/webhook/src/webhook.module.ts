import { config, validate } from '@app/config';
import { StripeModule } from '@app/stripe';
import { Module } from '@nestjs/common';
import { StripeWebhookModule } from './domain/stripe/stripe.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeorm from '@app/database/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
      validate,
      envFilePath: ['.env', '.env.example'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
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
