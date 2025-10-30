import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Landmark } from './landmark.entity';
import { GlassesModel } from './glasses-model.entity';
import { BaseEntity } from '../../shared/src/base.entity';

type Transform = {
  position: Record<'x' | 'y' | 'z', number>;
  rotation: Record<'x' | 'y' | 'z', number>;
  scale: Record<'x' | 'y' | 'z', number>;
};

@Entity('fit_glasses')
export class FitGlasses extends BaseEntity {
  @ManyToOne(() => Landmark, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  landMark: Landmark;

  @ManyToOne(() => GlassesModel, { eager: true, nullable: false })
  @JoinColumn()
  glassesModel: GlassesModel;

  @Column({ type: 'jsonb', nullable: true, default: null })
  result: Transform;
}
