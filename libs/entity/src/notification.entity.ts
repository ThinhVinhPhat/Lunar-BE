import { NotificationType } from '../../constant/src/role';
import { BaseEntity } from '../../shared/src/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('notification')
export class NotificationTemplate extends BaseEntity {
  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  message: string;

  @Column({ type: 'simple-array', nullable: true, default: null })
  image?: string[];

  @Column({
    name: 'type',
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.NEW_MESSAGE,
  })
  type: NotificationType;

  @Column({
    name: 'is_global',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isGlobal?: boolean;

  @Column({ name: 'target_role', type: 'simple-array', nullable: true })
  targetRoles?: string[];

  @Column({ name: 'status', type: 'boolean', default: true })
  status: boolean;
}
