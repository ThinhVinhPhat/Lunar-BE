import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { BaseEntity } from '../../shared/src/base.entity';

@Entity()
export class GlassesModel extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  filePath: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => ProductVariant, (product) => product.glassesModel)
  @JoinColumn({ name: 'product_id' })
  product: ProductVariant;
}
