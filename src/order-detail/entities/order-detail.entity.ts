import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { Product } from '../../product/entities/product.entity';
import { BaseEntity } from '@/shared/base.entity';

@Entity('order_detail')
export class OrderDetail extends BaseEntity {
  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relationship with Order
  @ManyToOne(() => Order, (order) => order.orderDetails, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  // Relationship with Product
  @ManyToOne(() => Product, (product) => product.orderDetails)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
