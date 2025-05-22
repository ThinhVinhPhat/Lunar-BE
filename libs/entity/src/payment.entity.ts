import { PaymentMethod, PaymentStatus } from '../../constant/src/index';
import { BaseEntity } from '../../shared/src/index';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity('payment')
export class Payment extends BaseEntity {
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
    default: PaymentMethod.CREDIT_CARD,
  })
  method: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({
    type: 'enum',
    nullable: true,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
