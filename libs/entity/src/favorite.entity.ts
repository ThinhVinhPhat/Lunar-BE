import { Product, User } from '.';
import { BaseEntity } from '../../shared/src/index';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Favorite extends BaseEntity {
  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
