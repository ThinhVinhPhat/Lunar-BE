import { Module } from '@nestjs/common';
import { UsersModule } from './domain/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './domain/auth/auth.module';
import { AuthService } from './domain/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './domain/auth/jwt-auth.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeorm from '@app/database/typeorm';
import { User } from '../../../libs/entity/src/user.entity';
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
import { config, validate } from '@app/config/index';
import { CommentModule } from './domain/comment/comment.module';
import { StripeModule } from '@app/stripe';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: configService.get('MAILDEV_INCOMING_USER'),
            pass: configService.get('MAILDEV_INCOMING_PASS'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },

        template: {
          dir: process.cwd() + '/src/mail/template/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
      validate,
      envFilePath: ['.env', '.env.example'],
    }),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    StripeModule.forRoot({
      secretKey: config.STRIPE.STRIPE_SERECT_KEY,
    }),
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
