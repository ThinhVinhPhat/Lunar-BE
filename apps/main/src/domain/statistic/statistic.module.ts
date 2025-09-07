import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, Product, User, MonthlyAnalytics } from '@app/entity';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product, Order, MonthlyAnalytics]),
    CommonModule,
  ],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {}
