import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Discount } from './discount.entity';
import { Product } from './product.entity';
import { BaseEntity } from '../../shared/src/base.entity';

@Entity('discount_products')
export class DiscountProduct extends BaseEntity {
  @ManyToOne(() => Discount, (discount) => discount.discountProduct)
  @JoinColumn({ name: 'discount_id' })
  discount: Discount;

  @ManyToOne(() => Product, (product) => product.discountProduct)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'timestamp', nullable: true })
  appliedAt?: Date;

  @Column({ type: 'float', nullable: true })
  customDiscountRate?: number;
}
