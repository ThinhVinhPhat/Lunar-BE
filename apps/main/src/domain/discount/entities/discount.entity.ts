import { DiscountType } from '../../../constant/role';
import { BaseEntity } from '@app/shared/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserDiscount } from './user-discount.entity';

@Entity()
export class Discount extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description: string;

  @Column({ type: 'int', nullable: true })
  value: number;

  @Column({ type: 'enum', enum: DiscountType, nullable: true })
  type: DiscountType;

  @Column({ type: 'int', default: 0 })
  thresholdAmount: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expireAt: Date;

  @OneToMany(() => UserDiscount, (userDiscount) => userDiscount.discount)
  userDiscounts: UserDiscount[];
}
