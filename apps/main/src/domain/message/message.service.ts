import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation, Message, User } from '@app/entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { message } from '@app/constant';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    private readonly dataSource: DataSource,
  ) {}

  private getConversation(
    senderId: string,
    receiverId: string,
  ): Promise<Conversation> {
    const conversation = this.conversationRepo.findOne({
      where: [
        {
          sender: { id: senderId },
          receiver: { id: receiverId },
        },
        {
          sender: { id: receiverId },
          receiver: { id: senderId },
        },
      ],
      relations: {
        receiver: true,
        sender: true,
        messages: true,
      },
    });
    return conversation;
  }

  async createMessage(dto: CreateMessageDto): Promise<Message> {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const { receiverId, senderId, content } = dto;
        let currentConversation = null;
        console.log(receiverId);
        console.log(senderId);

        const receiver = await transactionManager.findOne(User, {
          where: { id: receiverId },
        });
        const sender = await transactionManager.findOne(User, {
          where: { id: senderId },
        });

        if (!receiver) {
          throw new NotFoundException(' Receiver not found');
        }
        if (!sender) {
          throw new NotFoundException('Sender not found');
        }
        const conversation = await this.getConversation(senderId, receiverId);

        if (!conversation) {
          const newConversation = transactionManager.create(Conversation, {
            receiver: receiver,
            sender: sender,
            messages: [],
          });
          await transactionManager.save(Conversation, newConversation);
          currentConversation = newConversation;
        } else {
          currentConversation = conversation;
        }

        const msg = transactionManager.create(Message, {
          conversation: currentConversation,
          sender: sender,
          content: content,
          isRead: false,
          createdAt: new Date(),
        });
        await transactionManager.save(Message, msg);
        currentConversation.messages.push(msg);
        await transactionManager.save(Conversation, currentConversation);

        return msg;
      },
    );
  }

  async getMessagesBetweenUsers(senderId: string, receiverId: string) {
    const receiver = await this.userRepo.findOne({ where: { id: receiverId } });
    const sender = await this.userRepo.findOne({ where: { id: senderId } });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    const conversation = await this.getConversation(senderId, receiverId);

    const unreadMessages = conversation.messages.filter(
      (msg) => msg.sender.id !== sender.id && !msg.isRead,
    );

    for (const msg of unreadMessages) {
      msg.isRead = true;
      await this.messageRepo.save(msg);
    }

    return {
      data: conversation.messages,
      message: message.GET_BETWEEN_USER_SUCCESS,
    };
  }

  async getUserMessage(userId: string) {
    const userConversations = await this.conversationRepo.find({
      where: {
        receiver: {
          id: userId,
        },
      },
      relations: {
        messages: true,
        sender: true,
        receiver: true,
      },
    });

    const userMessage = userConversations
      .map((item) => {
        const messages = item.messages.map((msg) =>
          msg.sender.id !== userId ? msg : null,
        );
        return messages.filter(Boolean);
      })
      .flat();

    return {
      data: userMessage,
      message: message.GET_USER_MESSAGE_SUCCESS,
    };
  }
}
