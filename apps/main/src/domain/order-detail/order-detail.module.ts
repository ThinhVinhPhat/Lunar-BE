import { Module } from '@nestjs/common';
import { OrderDetailService } from './order-detail.service';
import { OrderDetailController } from './order-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@app/entity/order.entity';
import { Product } from '@app/entity/product.entity';
import { OrderDetail } from '../../../../../libs/entity/src/order-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, OrderDetail])],
  controllers: [OrderDetailController],
  providers: [OrderDetailService],
})
export class OrderDetailModule {}
