import { Product } from '@app/entity';
import { Respond } from '..';

export interface MonthlyAnalytics {
  id: string;
  month: string;
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  totalNewUsers: number;
  topProductSlugs: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GetSummaryResponse extends Respond {
  data: {
    totalNewUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalViews: number;
    topProducts: Product[];
  };
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
    categoryCounts: { [key: string]: number };
  };
}

export interface UpdateSummaryResponse extends Respond {
  data: MonthlyAnalytics;
}
