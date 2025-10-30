import { BaseEntity } from '../../shared/src/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('landmarks')
export class Landmark extends BaseEntity {
  @Column('text')
  imageBase64: string;

  @Column('jsonb')
  landmarks: { x: number; y: number; z: number }[];

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;
}
