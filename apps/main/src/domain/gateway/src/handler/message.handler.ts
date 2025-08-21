import { MessageService } from '@/domain/message/message.service';
import { Server } from 'socket.io';

export class MessageHandler {
  private server: Server;
  private messageService: MessageService;

  constructor(server: Server, messageService: MessageService) {
    this.server = server;
    this.messageService = messageService;
  }

  async handleSendMessage(data: any, onlineUsers: Map<string, any>) {
    const message = await this.messageService.createMessage(data);
    const receiver = onlineUsers.get(data.receiverId);
    if (receiver) {
      this.server.to(receiver.socketId).emit('receive_message', message);
    }
    return message;
  }
}
