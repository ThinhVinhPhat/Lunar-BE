import { BaseEntity } from '../../shared/src/index';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'monthly_analytics' })
export class MonthlyAnalytics extends BaseEntity {
  @Column({ type: 'date' })
  month: string;

  @Column({ type: 'int', default: 0 })
  totalViews: number;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'int', default: 0 })
  totalNewUsers: number;

  @Column({ type: 'text', array: true, nullable: true })
  topProductSlugs: string[];
}
