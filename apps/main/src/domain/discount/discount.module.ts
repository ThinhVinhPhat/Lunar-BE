import { Module } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from '../../../../../libs/entity/src/discount.entity';
import { UserDiscount } from '@app/entity/user-discount.entity';
import { User } from '@app/entity/user.entity';
import { DiscountProduct, Order, Product } from '@app/entity';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Discount,
      UserDiscount,
      User,
      DiscountProduct,
      Product,
      Order,
    ]),
    CommonModule,
  ],
  controllers: [DiscountController],
  providers: [DiscountService],
  exports: [DiscountService],
})
export class DiscountModule {}
