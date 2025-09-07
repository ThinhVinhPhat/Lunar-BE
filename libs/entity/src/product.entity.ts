import { Comment } from './comment.entity';
import { OrderDetail } from './order-detail.entity';
import { ProductCategory } from './product-category.entity';
import { BaseEntity } from '../../shared/src/index';
import { Column, Entity, OneToMany } from 'typeorm';
import { Favorite } from './favorite.entity';
import { DiscountProduct } from './product-discount.entity';

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

  @Column({ type: 'int', default: 0 })
  views: number;

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

  @OneToMany(() => Favorite, (favorite) => favorite.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  favorites: Favorite[];

  @OneToMany(
    () => DiscountProduct,
    (productDiscount) => productDiscount.product,
  )
  discountProduct: DiscountProduct[];
}
