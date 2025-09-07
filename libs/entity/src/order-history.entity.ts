import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';
import { BaseEntity } from '../../shared/src/index';
import { OrderHistoryAction } from '../../constant/src/role';

@Entity('order_history')
export class OrderHistory extends BaseEntity {
  @Column({ type: 'enum', enum: OrderHistoryAction, nullable: true })
  action: OrderHistoryAction;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Order, (order) => order.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'performed_by' })
  performedBy: User;
}
