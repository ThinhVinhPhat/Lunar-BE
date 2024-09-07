import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LikesModule } from './likes/likes.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenusModule } from './menus/menus.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { MenuItemOptionsModule } from './menu-item-options/menu-item-options.module';
import { ReviewsModule } from './reviews/reviews.module';
import { OrdersModule } from './orders/orders.module';
import { OrderDetailModule } from './order-detail/order-detail.module';

@Module({
  imports: [
    UsersModule, 
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    LikesModule,
    RestaurantsModule,
    MenusModule,
    MenuItemsModule,
    MenuItemOptionsModule,
    ReviewsModule,
    OrdersModule,
    OrderDetailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
