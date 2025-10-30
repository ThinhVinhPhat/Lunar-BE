import {
  Entity,
  ManyToOne,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { BaseEntity } from '../../shared/src/base.entity';
import { OrderDetail } from './order-detail.entity';
import { Favorite } from './favorite.entity';
import { DiscountProduct } from './product-discount.entity';
import { ProductCategory } from '.';
import { Comment } from './comment.entity';
import { GlassesModel } from './glasses-model.entity';

export type GlassesSize = Record<
  'lens' | 'bridge' | 'overallWidth' | 'temple',
  number
>;

@Entity('product-variant')
export class ProductVariant extends BaseEntity {
  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column()
  color: string;

  @Column({ type: 'jsonb', nullable: true })
  size: GlassesSize;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount_percentage: number;

  @Column({ type: 'int', nullable: true })
  stock: number;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'boolean', default: false })
  isNew: boolean;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.variant)
  orderDetails: OrderDetail[];

  @OneToMany(
    () => DiscountProduct,
    (productDiscount) => productDiscount.product,
  )
  discountProduct: DiscountProduct[];

  @OneToMany(
    () => ProductCategory,
    (productCategory) => productCategory.variant,
    { cascade: true, onDelete: 'CASCADE' },
  )
  productCategories: ProductCategory[];

  @OneToMany(() => Favorite, (favorite) => favorite.variant, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  favorites: Favorite[];

  @OneToMany(() => Comment, (comment) => comment.variant)
  comments: Comment[];

  @OneToOne(() => GlassesModel, (glassesModel) => glassesModel.product)
  @JoinColumn({ name: 'model_id' })
  glassesModel: GlassesModel;
}
