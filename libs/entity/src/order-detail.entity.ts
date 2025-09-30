import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { BaseEntity } from '../../shared/src/index';
import { ProductVariant } from './product-variant.entity';

@Entity('order_detail')
export class OrderDetail extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, length: 255 })
  product_name: string;

  @Column({ type: 'integer', nullable: true })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total: number;

  @ManyToOne(() => Order, (order) => order.orderDetails)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => ProductVariant, (variant) => variant.orderDetails)
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;
}
