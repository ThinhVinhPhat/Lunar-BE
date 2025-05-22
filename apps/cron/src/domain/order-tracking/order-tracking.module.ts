import {
  Category,
  CategoryDetail,
  Discount,
  Favorite,
  Order,
  OrderDetail,
  Comment,
  Payment,
  Product,
  ProductCategory,
  User,
  OrderTracking,
  MonthlyAnalytics,
  OrderHistory,
  UserDiscount,
} from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTrackingConsumer } from './order-tracking.consumer';
import { OrderTrackingProcessor } from './order-tracking.proccessor';
import { OrderModule } from '@/domain/order/order.module';
import { OrderTrackingService } from './order-tracking.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      CategoryDetail,
      Comment,
      Discount,
      OrderDetail,
      Order,
      Payment,
      ProductCategory,
      Product,
      User,
      Favorite,
      UserDiscount,
      MonthlyAnalytics,
      OrderHistory,
      OrderTracking,
    ]),
    OrderModule,
    BullModule.registerQueue({
      name: 'order_tracking',
    }),
  ],
  controllers: [],
  providers: [
    OrderTrackingConsumer,
    OrderTrackingProcessor,
    OrderTrackingService,
  ],
  exports: [OrderTrackingService],
})
export class OrderTrackingModule {}
