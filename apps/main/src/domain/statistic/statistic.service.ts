import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Order, Product, User } from '@app/entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MonthlyAnalytics } from '@app/entity/monthly-statistic.entity';
import { CompareValueDTO } from './dto/compare.dto';
import { message } from '@app/constant';
import {
  CompareLastMonthResponse,
  GetRevenueAndCategoriesResponse,
  GetSummaryResponse,
  UpdateSummaryResponse,
} from '@app/type/statistic/statistic.respond';
import { Respond } from '@app/type';
import {
  GetRevenueAndCategoriesResponseDto,
  StatisticResponse,
} from './dto/statistic.respond.dto';
import { plainToInstance } from 'class-transformer';
import { OrderRespondDto } from '../order/dto/order.respond.dto';
import { GetUserOrdersDTO } from './dto/get-user-orders.dto';
import { CommonService } from '@app/common';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MonthlyAnalytics)
    private readonly analyticRepository: Repository<MonthlyAnalytics>,
    private readonly commonService: CommonService,
  ) {}

  private StatisticResponse(data: any, message: string): GetSummaryResponse {
    return {
      status: HttpStatus.OK,
      data: plainToInstance(StatisticResponse, data, {
        excludeExtraneousValues: true,
      }),
      message: message,
    };
  }

  async getSummary(): Promise<GetSummaryResponse> {
    const topProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: true })
      .orderBy('product.views', 'DESC')
      .limit(3)
      .getMany();
    const validSlugs = topProducts.map((product) => product.slug);

    const now = new Date();
    const month = now.toISOString().split('T')[0].split('-')[1];

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
      where: { month: month },
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

    return this.StatisticResponse(
      {
        ...monthAnalytic,
        topProducts: topProducts,
      },
      message.FIND_SUMMARY_SUCCESS,
    );
  }

  async getUserOrders(userId: string, query: GetUserOrdersDTO) {
    const { page = 0, limit = 10, filter } = query;
    const now = new Date();
    let startDate: Date | null = null;
    const { skip } = this.commonService.getPaginationMeta(page, limit);

    switch (filter) {
      case 'last 24 hour':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'last 2 days':
        startDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        break;
      case 'last 7 day':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'Recent':
      default:
        startDate = null;
        break;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(message.USER_NOT_EXISTS);
    }

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
    }

    const [orders, total] = await queryBuilder.getManyAndCount();

    // Add time difference between now and order creation time
    const ordersWithTimeDiff = orders.map((order) => {
      const diffMs = now.getTime() - order.createdAt.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeDiffStr = '';
      if (diffDays > 0) {
        timeDiffStr = `${diffDays} day(s) ago`;
      } else if (diffHours > 0) {
        timeDiffStr = `${diffHours} hour(s) ago`;
      } else if (diffMinutes > 0) {
        timeDiffStr = `${diffMinutes} minute(s) ago`;
      } else {
        timeDiffStr = 'Just now';
      }

      return {
        ...order,
        timeSinceOrder: timeDiffStr,
      };
    });

    return {
      status: HttpStatus.OK,
      data: plainToInstance(OrderRespondDto, ordersWithTimeDiff, {
        excludeExtraneousValues: true,
      }),
      meta: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
      message: message.FIND_ORDER_SUCCESS,
    };
  }

  async compareLastMonth(
    compareValueDto: CompareValueDTO,
  ): Promise<CompareLastMonthResponse> {
    const { totalCustomer, totalOrder, totalRevenue, totalView } =
      compareValueDto;
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    const lastMonth = (prevMonthDate.getMonth() + 1)
      .toString()
      .padStart(2, '0');

    const value = await this.analyticRepository.findOne({
      where: {
        month: lastMonth,
      },
    });

    if (!value) {
      throw new NotFoundException('There are no value recorded in last month');
    }

    const calcChange = (current: number, previous: number) => {
      if (previous === 0) {
        return current === 0 ? 0 : 100;
      }
      return ((current - previous) / previous) * 100;
    };

    const changeCustomer = calcChange(totalCustomer, value.totalNewUsers);
    const changeOrder = calcChange(totalOrder, value.totalOrders);
    const changeRevenue = calcChange(totalRevenue, value.totalRevenue);
    const changeView = calcChange(totalView, value.totalViews);

    return {
      status: HttpStatus.OK,
      data: {
        changeCustomer: changeCustomer.toFixed(2),
        changeOrder: changeOrder.toFixed(2),
        changeRevenue: changeRevenue.toFixed(2),
        changeView: changeView.toFixed(2),
      },
      message: message.COMPARISON_WITH_LAST_MONTH_SUCCESS,
    };
  }

  async getRevenueAndCategories(): Promise<GetRevenueAndCategoriesResponse> {
    const monthlyRevenues = await this.analyticRepository.find();

    const totalRevenue = monthlyRevenues.reduce(
      (acc, revenue) => acc + (Number(revenue.totalRevenue) ?? 0),
      0,
    );

    const categoryNames = [
      'Metal Originals',
      'Wood Classics',
      'Acetate Originals',
      'Smokey Bear',
      'CAMP Classics',
      'National Parks',
      'Pendleton Eyewear',
      'ACTV Performance',
    ];

    const categoryCounts = {};

    for (const categoryName of categoryNames) {
      const count = await this.productRepository
        .createQueryBuilder('product')
        .innerJoin('product.productCategories', 'productCategory')
        .innerJoin('productCategory.categoryDetails', 'categoryDetail')
        .where('categoryDetail.name = :categoryName', { categoryName })
        .getCount();

      categoryCounts[categoryName] = count;
    }

    return {
      status: HttpStatus.OK,
      data: plainToInstance(GetRevenueAndCategoriesResponseDto, {
        monthlyRevenues,
        totalRevenue: Number(totalRevenue).toFixed(2),
        categoryCounts,
      }),
      message: message.FIND_REVENUE_AND_CATEGORY_SUCCESS,
    };
  }

  async updateSummary(
    id: string,
    month: string,
  ): Promise<UpdateSummaryResponse> {
    const analytic = await this.analyticRepository.findOne({
      where: { id: id },
    });
    if (!analytic) {
      throw new NotFoundException('Analytic not found');
    }

    analytic.month = month || analytic.month;
    await this.analyticRepository.save(analytic);
    return this.StatisticResponse(analytic, message.UPDATE_SUMMARY_SUCCESS);
  }

  async deleteSummary(id: string): Promise<Respond> {
    const summary = await this.analyticRepository.findOne({
      where: { id: id },
    });
    if (!summary) {
      throw new NotFoundException('Summary not found');
    }
    await this.analyticRepository.delete(id);
    return this.StatisticResponse(summary, message.DELETE_SUMMARY_SUCCESS);
  }
}
