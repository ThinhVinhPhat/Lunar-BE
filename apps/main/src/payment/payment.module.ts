import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'apps/main/src/users/entity/user.entity';
import { Order } from 'apps/main/src/order/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
