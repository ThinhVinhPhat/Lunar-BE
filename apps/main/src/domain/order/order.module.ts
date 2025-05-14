import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/entity/user.entity';
import { Order } from '../../../../../libs/entity/src/order.entity';
import { OrderHistory } from '@app/entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, OrderHistory])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
