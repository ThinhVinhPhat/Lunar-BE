import { User } from './user.entity';
import { BaseEntity } from '../../shared/src/index';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Discount } from './discount.entity';

@Entity()
export class UserDiscount extends BaseEntity {
  @Column({ type: 'integer', name: 'user_id' })
  quantity: number;

  @ManyToOne(() => User, (user) => user.userDiscounts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Discount, (discount) => discount.userDiscounts)
  @JoinColumn({ name: 'discount_id' })
  discount: Discount;
}
