import { OrderStatus } from '../../constant/src/index';
import { OrderDetail } from './order-detail.entity';
import { BaseEntity } from '../../shared/src/index';
import { User } from './user.entity';
import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Payment } from './payment.entity';
import { OrderHistory } from './order-history.entity';
import { OrderTracking } from './order-tracking.entity';
import { Shipment } from './shipment.entity';
import { Discount } from './discount.entity';

@Entity('order')
export class Order extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  shippingAddress: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  shipPhone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  shippingFee: number;

  @Column({ type: 'date', nullable: true })
  orderDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total_price: number;

  @Column({
    type: 'decimal',
    name: 'final_price',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  finalPrice: number;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];

  @ManyToOne(() => User, (user) => user.orders, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Payment, (payment) => payment.order, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  payment: Payment;

  @OneToMany(() => OrderTracking, (track) => track.order)
  orderTracks: OrderTracking[];

  @OneToMany(() => OrderHistory, (history) => history.order)
  histories: OrderHistory[];

  @OneToMany(() => Shipment, (shipment) => shipment.order)
  shipments: Shipment[];

  @OneToMany(() => Discount, (discount) => discount.order)
  discounts: Discount[];
}
