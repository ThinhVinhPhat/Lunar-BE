import { Product } from '@app/entity';
import { Respond } from '..';

export interface MonthlyAnalytics {
  id: string;
  month: string;
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  totalNewUsers: number;
  topProducts: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GetSummaryResponse extends Respond {
  data: MonthlyAnalytics;
}

export interface CompareLastMonthResponse extends Respond {
  data: {
    changeCustomer: string;
    changeOrder: string;
    changeRevenue: string;
    changeView: string;
  };
}

export interface GetRevenueAndCategoriesResponse extends Respond {
  data: {
    monthlyRevenues: MonthlyAnalytics[];
    totalRevenue: string;
    categoryCounts: any;
  };
}

export interface UpdateSummaryResponse extends Respond {
  data: MonthlyAnalytics;
}
