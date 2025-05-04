import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/entity/user.entity';
import { Order } from '@app/entity/order.entity';
import { Product } from '@app/entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Product])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
