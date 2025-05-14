import { Module } from '@nestjs/common';
import { UsersModule } from './domain/users/users.module';
import { AuthModule } from './domain/auth/auth.module';
import { AuthService } from './domain/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
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

@Module({
  imports: [
    StripeModule.forRoot({
      secretKey: config.STRIPE.STRIPE_SERECT_KEY,
    }),
    SharedModule,
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
  ],
})
export class AppModule {}
