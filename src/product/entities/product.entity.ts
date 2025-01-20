import { OrderDetail } from '@/order-detail/entities/order-detail.entity';
import { ProductCategory } from '@/product/entities/product-category.entity';
import { BaseEntity } from '@/shared/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'int' })
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
}
