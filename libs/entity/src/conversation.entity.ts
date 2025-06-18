import { BaseEntity } from '../../shared/src/base.entity';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity('conversation')
export class Conversation extends BaseEntity {
  @ManyToOne(() => User, (user) => user.receiverConversations, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @ManyToOne(() => User, (user) => user.senderConversations, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
