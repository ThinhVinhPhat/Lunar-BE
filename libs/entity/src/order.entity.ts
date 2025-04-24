import { OrderStatus } from '@app/constant/role';
import { OrderDetail } from '@app/entity/order-detail.entity';
import { BaseEntity } from '@app/shared/base.entity';
import { User } from '@app/entity/user.entity';
import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Payment } from '@app/entity/payment.entity';

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

  @Column({ type: 'varchar', nullable: true })
  paymentId: string;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];

  @ManyToOne(() => User, (user) => user.orders, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Payment, (payment) => payment.order, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  payments: Payment[];
}
