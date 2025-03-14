import { CategoryDetail } from '@/category-detail/entities/category-detail.entity';
import { BaseEntity } from '@/shared/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Category extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  name: string;
  
  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'boolean', nullable: true, default: true })
  status: boolean;

  @OneToMany(() => CategoryDetail, (categoryDetail) => categoryDetail.category)
  categoryDetails: CategoryDetail[];
}
