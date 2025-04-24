import { CategoryDetail } from '@app/entity/category-detail.entity';
import { BaseEntity } from '@app/shared/base.entity';
import { Product } from '@app/entity/product.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class ProductCategory extends BaseEntity {
  @Column({ type: 'int', nullable: true })
  quantity: number;

  @ManyToOne(
    () => CategoryDetail,
    (categoryDetail) => categoryDetail.productCategories,
  )
  categoryDetails: CategoryDetail;

  @ManyToOne(() => Product, (product) => product.productCategories)
  product: Product;
}
