import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './domain/users/users.module';
import { AuthModule } from './domain/auth/auth.module';
import { AuthService } from './domain/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './domain/guard/jwt-auth.guard';
import { ProductModule } from './domain/product/product.module';
import { MulterModule } from '@nestjs/platform-express';
import { UploadModule } from './domain/upload/upload.module';
import { UploadService } from './domain/upload/upload.service';
import { CategoryModule } from './domain/category/category.module';
import { CategoryDetailModule } from './domain/category-detail/category-detail.module';
import { OrderModule } from './domain/order/order.module';
import { OrderDetailModule } from './domain/order-detail/order-detail.module';
import { PaymentModule } from './domain/payment/payment.module';
import { DiscountModule } from './domain/discount/discount.module';
import { CommentModule } from './domain/comment/comment.module';
import { SharedModule } from '@app/shared';
import { StripeModule } from '@app/stripe';
import { config } from '@app/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/entity';
import { FavoriteModule } from './domain/favorite/favorite.module';
import { StatisticModule } from './domain/statistic/statistic.module';
import { LoggingMiddleware } from '@app/middleware';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis';
import { MessageModule } from './domain/message/src/message.module';
@Module({
  imports: [
    StripeModule.forRoot({
      secretKey: config.STRIPE.STRIPE_SERECT_KEY,
    }),
    SharedModule,
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
    TypeOrmModule.forFeature([User]),
    UsersModule,
    AuthModule,
    ProductModule,
    UploadModule,
    MulterModule.register({
      dest: './uploads',
    }),
    CategoryModule,
    CategoryDetailModule,
    OrderModule,
    OrderDetailModule,
    PaymentModule,
    DiscountModule,
    CommentModule,
    FavoriteModule,
    StatisticModule,
    MessageModule,
  ],
  controllers: [],
  providers: [
    AuthService,
    JwtService,
    UploadService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingMiddleware,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
