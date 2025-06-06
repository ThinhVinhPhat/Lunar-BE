import { Product } from '@/product/entities/product.entity';
import { BaseEntity } from '@/shared/base.entity';
import { User } from '@/users/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  content: string;

  @Column({ type: 'int', nullable: true })
  rate: number;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'boolean', nullable: true, default: true })
  status: boolean;

  @ManyToOne(() => User, (user) => user.comments, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.comments, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
