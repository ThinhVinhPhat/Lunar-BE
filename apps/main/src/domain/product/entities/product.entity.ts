import { Comment } from '@/domain/comment/entities/comment.entity';
import { OrderDetail } from '@/domain/order-detail/entities/order-detail.entity';
import { ProductCategory } from '@/domain/product/entities/product-category.entity';
import { BaseEntity } from '@app/shared/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  slug: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount_percentage: number;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'int', nullable: true })
  stock: number;

  @Column({ type: 'varchar', nullable: true })
  video: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'boolean', default: false })
  isFreeShip: boolean;

  @Column({ type: 'boolean', default: false })
  isNew: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @OneToMany(
    () => ProductCategory,
    (productCategory) => productCategory.product,
    { cascade: true, onDelete: 'CASCADE' },
  )
  productCategories: ProductCategory[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.product)
  orderDetails: OrderDetail[];

  @OneToMany(() => Comment, (comment) => comment.product)
  comments: Comment[];
}
