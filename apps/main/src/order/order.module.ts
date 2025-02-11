import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'apps/main/src/users/entity/user.entity';
import { Order } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
