import { BaseEntity } from '../../shared/src/base.entity';
import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { ShipmentStatus } from '../../constant/src/index';

@Entity('shipment')
export class Shipment extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.shipments, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ nullable: true }) shippingCarrier: string;
  @Column({ nullable: true }) trackingNumber: string;
  @Column({ nullable: true }) deliveredAt: Date;
  @Column({ nullable: true }) estimatedDeliveryDate: Date;
  @Column({ nullable: true, enum: ShipmentStatus, type: 'enum' })
  status: ShipmentStatus;
}
