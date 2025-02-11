import { OrderStatus } from 'apps/main/src/constant/role';
import { OrderDetail } from 'apps/main/src/order-detail/entities/order-detail.entity';
import { BaseEntity } from '@app/shared/base.entity';
import { User } from 'apps/main/src/users/entity/user.entity';
import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

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

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
