import { DiscountType, DiscountValueType } from '../../constant/src/role';
import { BaseEntity } from '../../shared/src/index';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserDiscount } from './user-discount.entity';
import { DiscountProduct } from './product-discount.entity';
import { Order } from './order.entity';

@Entity()
export class Discount extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'int', nullable: false })
  value: number; // % hoặc số tiền

  @Column({
    type: 'enum',
    enum: DiscountValueType,
    default: DiscountValueType.PERCENTAGE,
  })
  valueType: DiscountValueType; // ENUM: 'PERCENT' | 'FIXED'

  @Column({ type: 'enum', enum: DiscountType, nullable: false })
  discountType: DiscountType;

  @Column({ type: 'int', default: 0 })
  thresholdAmount: number; // điều kiện đơn tối thiểu

  @Column({ type: 'int', default: 0 })
  usageLimit: number; // tổng lượt dùng được (site-wide)

  @Column({ type: 'timestamp', nullable: true })
  startAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expireAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => UserDiscount, (userDiscount) => userDiscount.discount)
  userDiscounts: UserDiscount[];

  @OneToMany(
    () => DiscountProduct,
    (productDiscount) => productDiscount.discount,
  )
  discountProduct: DiscountProduct[]; // chỉ áp dụng cho một số sản phẩm cụ thể

  @ManyToOne(() => Order, (order) => order.discounts)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
