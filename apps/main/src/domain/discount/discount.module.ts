import { Module } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity';
import { UserDiscount } from '@/domain/discount/entities/user-discount.entity';
import { User } from '@/domain/users/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Discount, UserDiscount, User])],
  controllers: [DiscountController],
  providers: [DiscountService],
})
export class DiscountModule {}
