import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Order, Product, User } from '@app/entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MonthlyAnalytics } from '@app/entity/monthly-statistic.entity';
import { CompareValueDTO } from './dto/compare.dto';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<Order>,
    @InjectRepository(MonthlyAnalytics)
    private readonly analyticRepository: Repository<MonthlyAnalytics>,
  ) {}

  async getSummary() {
    const maxResult = await this.productRepository
      .createQueryBuilder('product')
      .select('MAX(product.views)', 'max')
      .getRawOne();
    const max = maxResult?.max ?? 0;

    const topProducts = await this.productRepository.find({
      where: {
        views: max,
      },
    });
    const validSlugs = topProducts.map((product) => product.slug);

    const now = new Date();
    const month = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const totalNewUsers = await this.userRepository.count({
      where: {
        createdAt: Between(
          new Date(now.getFullYear(), now.getMonth(), 1),
          new Date(now.getFullYear(), now.getMonth() + 1, 0),
        ),
      },
    });

    const totalOrders = await this.orderRepository.count({
      where: {
        createdAt: Between(
          new Date(now.getFullYear(), now.getMonth(), 1),
          new Date(now.getFullYear(), now.getMonth() + 1, 0),
        ),
      },
    });

    const totalRevenue = await this.orderRepository.sum('total_price', {
      createdAt: Between(
        new Date(now.getFullYear(), now.getMonth(), 1),
        new Date(now.getFullYear(), now.getMonth() + 1, 0),
      ),
    });

    const totalViews = await this.productRepository.sum('views');

    // Create or update monthly analytics
    let monthAnalytic = await this.analyticRepository.findOne({
      where: { month },
    });
    if (!monthAnalytic) {
      monthAnalytic = this.analyticRepository.create({
        month,
        totalViews: totalViews === null ? 0 : totalViews,
        totalOrders: totalOrders ?? 0,
        totalRevenue: totalRevenue ?? 0,
        totalNewUsers: totalNewUsers ?? 0,
        topProductSlugs: validSlugs ?? [],
      });
    } else {
      monthAnalytic.totalViews = totalViews === null ? 0 : totalViews;
      monthAnalytic.totalOrders = totalOrders ?? 0;
      monthAnalytic.totalRevenue = totalRevenue ?? 0;
      monthAnalytic.totalNewUsers = totalNewUsers ?? 0;
      monthAnalytic.topProductSlugs = validSlugs ?? [];
    }
    await this.analyticRepository.save(monthAnalytic);

    return {
      status: HttpStatus.OK,
      data: {
        totalNewUsers,
        totalOrders,
        totalRevenue,
        totalViews: totalViews === null ? 0 : totalViews,
        topProducts,
        // monthAnalytic,
      },
      message: 'Get Summary Successfully',
    };
  }

  async compareLastMonth(compareValueDto: CompareValueDTO) {
    const { totalCustomer, totalOrder, totalRevenue, totalView } =
      compareValueDto;
    const now = new Date();
    const month = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const value = await this.analyticRepository.findOne({
      where: {
        month: month,
      },
    });

    if (!value) {
      throw new HttpException(
        'There are no value recorded in this month',
        HttpStatus.BAD_REQUEST,
      );
    }

    const calcChange = (current: number, previous: number) => {
      if (previous === 0) {
        return current === 0 ? 0 : 100;
      }
      return ((current - previous) / previous) * 100;
    };

    console.log(value);

    const changeCustomer = calcChange(totalCustomer, value.totalNewUsers);
    const changeOrder = calcChange(totalOrder, value.totalOrders);
    const changeRevenue = calcChange(totalRevenue, value.totalRevenue);
    const changeView = calcChange(totalView, value.totalViews);

    return {
      status: HttpStatus.OK,
      data: {
        changeCustomer,
        changeOrder,
        changeRevenue,
        changeView,
      },
      message: 'Comparison with last month calculated successfully',
    };
  }
}
