import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/entity/user.entity';
import { Order } from '@app/entity/order.entity';
import { Payment, Product } from '@app/entity';
import { ProductVariant } from '@app/entity/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, Product, Payment, ProductVariant]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
