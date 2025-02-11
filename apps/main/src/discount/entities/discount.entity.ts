import { DiscountType } from '@/constant/role';
import { BaseEntity } from '@app/shared/base.entity';
import { Column } from 'typeorm';

export class Discount extends BaseEntity {
  @Column({
    name: 'discount_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  discountName: string;

  @Column({ type: 'int', nullable: true })
  value: number;

  @Column({ type: 'enum', enum: DiscountType, nullable: true })
  type: DiscountType;

  @Column({ name: 'threshold_amount', type: 'int', default: 0 })
  thresholdAmount: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ name: 'expire_at', type: 'timestamp', nullable: true })
  expireAt: Date;
}
