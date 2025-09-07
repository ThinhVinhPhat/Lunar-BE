import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/entity/user.entity';
import { Order } from '../../../../../libs/entity/src/order.entity';
import { OrderHistory, OrderTracking, Shipment } from '@app/entity';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      OrderHistory,
      Shipment,
      OrderTracking,
    ]),
    CommonModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
