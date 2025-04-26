import { CategoryDetail } from './category-detail.entity';
import { BaseEntity } from '../../shared/src/index';
import { Product } from './product.entity';
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
