import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '@app/entity/index';
import { BaseEntity } from '@app/shared/base.entity';

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

  @ManyToOne(() => Order, (order) => order.orderDetails, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderDetails)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
