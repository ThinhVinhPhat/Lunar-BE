import { Discount } from '@app/entity';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DiscountScheduler {
  constructor(
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
  ) {}

  @Cron('*/10 * * * *')
  async deactivateExpiredDiscounts() {
    const now = new Date();
    await this.discountRepository
      .createQueryBuilder()
      .update()
      .set({ isActive: false })
      .where('expiredAt < :now', { now })
      .andWhere('isActive = true')
      .execute();
  }
}
