import { OrderDetail } from '@/order-detail/entities/order-detail.entity';
import { BaseEntity } from '@/shared/base.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('order')
export class Order extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  shippingAddress: string;

  @Column({ type: 'varchar', length: 20 })
  shipPhone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shippingFee: number;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string;

  @Column('uuid')
  paymentMethodId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];
}
