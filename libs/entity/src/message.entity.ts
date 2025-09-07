import { BaseEntity } from '../../shared/src/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';

@Entity('message')
export class Message extends BaseEntity {
  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true, default: false })
  isRead: boolean;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, (user) => user.messages, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}
