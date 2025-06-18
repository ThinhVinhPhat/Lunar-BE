import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { config } from '@app/config';
import { UsersService } from '@/domain/users/users.service';
import { Inject, forwardRef } from '@nestjs/common';

type UserProp = {
  socketId: string;
  connectedAt: number;
  isOnline: boolean;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, UserProp>();

  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = await this.jwtService.verify(token, {
        secret: config.JWT_REFRESH.SECRET,
      });
      const userId = payload.sub;

      if (!userId) {
        console.warn('Token không hợp lệ');
        client.disconnect();
        return;
      }

      this.onlineUsers.set(userId, {
        socketId: client.id,
        connectedAt: Date.now(),
        isOnline: true,
      });

      this.server.emit('user_status_online', {
        userId,
        isOnline: true,
        onLineAt: Date.now(),
      });

      await this.userService.updateOnlineStatus(userId);

      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (err) {
      console.error('Error in handleConnection:', err.message);
      client.disconnect();
    }
  }
  async handleDisconnect(client: Socket) {
    const userId = this.getUserIdBySocketId(client.id);
    if (userId) {
      this.onlineUsers.delete(userId);
      this.server.emit('user_status_offline', {
        userId,
        isOnline: false,
        offLineAt: new Date(),
      });
      await this.userService.updateOnlineStatus(userId);
      console.log(`User ${userId} disconnected (socket ${client.id})`);
    }

    this.server.emit('user_status_updated', {
      userId,
      isOnline: false,
    });
    console.log(`User ${userId} disconnected with socket ${client.id}`);
  }

  private getUserIdBySocketId(socketId: string): string | undefined {
    for (const [userId, info] of this.onlineUsers.entries()) {
      if (info.socketId === socketId) return userId;
    }
    return undefined;
  }

  getUserOnline(userId: string): UserProp {
    const user = this.onlineUsers.get(userId);
    return user ? user : null;
  }

  @SubscribeMessage('send_message')
  async handleMessage(@MessageBody() data: CreateMessageDto) {
    const message = await this.messageService.createMessage(data);
    const receiverInfo = this.onlineUsers.get(data.receiverId);

    if (receiverInfo) {
      this.server.to(receiverInfo.socketId).emit('receive_message', message);
    }

    console.log('Message sent');

    return message;
  }
}
