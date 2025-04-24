import { Category } from '@app/entity/category.entity';
import { ProductCategory } from '@app/entity/product-category.entity';
import { BaseEntity } from '@app/shared/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class CategoryDetail extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  image: string[];

  @Column({ type: 'boolean', nullable: true, default: true })
  status: boolean;

  @ManyToOne(() => Category, (category) => category.categoryDetails)
  category: Category;

  @OneToMany(
    () => ProductCategory,
    (productCategory) => productCategory.categoryDetails,
    { cascade: true, onDelete: 'CASCADE' },
  )
  productCategories: ProductCategory[];
}
