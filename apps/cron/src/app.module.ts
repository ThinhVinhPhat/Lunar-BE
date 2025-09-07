import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OrderTrackingModule } from './domain/order-tracking/order-tracking.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedModule } from '@app/shared';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggingMiddleware } from '@app/middleware';
import { DiscountTrackingModule } from './domain/discount-tracking/discount-tracking.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          username: config.get('REDIS_USERNAME'),
          password: config.get('REDIS_PASSWORD'),
          keepAlive: 5000,
        },
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: redisStore as any,
        host: config.get('REDIS_HOST'),
        port: config.get<number>('REDIS_PORT'),
        ttl: 60,
      }),
      isGlobal: true,
    }),
    SharedModule,
    ScheduleModule.forRoot(),
    DiscountTrackingModule,
    OrderTrackingModule,
  ],
  controllers: [],
  providers: [],
  exports: [OrderTrackingModule],
})
export class CronServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
