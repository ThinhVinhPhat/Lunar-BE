import { CategoryDetail } from './category-detail.entity';
import { BaseEntity } from '../../shared/src/index';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity()
export class ProductCategory extends BaseEntity {
  @Column({ type: 'int', nullable: true })
  quantity: number;

  @ManyToOne(
    () => CategoryDetail,
    (categoryDetail) => categoryDetail.productCategories,
  )
  categoryDetail: CategoryDetail;

  @ManyToOne(() => ProductVariant, (product) => product.productCategories)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}
