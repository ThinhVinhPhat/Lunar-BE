import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseEntity } from '../../shared/src/base.entity';
import { NotificationTemplate } from './notification.entity';

@Entity('user_notification')
export class UserNotification extends BaseEntity {
  @ManyToOne(() => NotificationTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_template_id' })
  notification: NotificationTemplate;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ name: 'status', type: 'boolean', default: true })
  status: boolean;
}
