import { OrderStatus } from '../../constant/src/index';
import { Order } from '.';
import { BaseEntity } from '../../shared/src/index';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

@Entity('order_tracking')
export class OrderTracking extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  currentAddress: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    nullable: true,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ManyToOne(() => Order, (order) => order.orderTracks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
