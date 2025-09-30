import { BaseEntity } from '../../shared/src/index';
import { Column, Entity, OneToMany } from 'typeorm';
import { Favorite } from './favorite.entity';
import { DiscountProduct } from './product-discount.entity';
import { ProductVariant } from './product-variant.entity';

@Entity()
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  slug: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

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

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  variants: ProductVariant[];
}
