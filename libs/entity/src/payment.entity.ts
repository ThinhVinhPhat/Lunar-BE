import { PaymentStatus } from '../../constant/src/index';
import { BaseEntity } from '../../shared/src/index';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity('payment')
export class Payment extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, length: 50, default: 'Visa' })
  method: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;
  @Column({
    type: 'varchar',
    nullable: false,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ManyToOne(() => Order, (order) => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
