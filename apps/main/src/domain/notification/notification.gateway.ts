import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Inject, forwardRef } from '@nestjs/common';

import { UsersService } from '@/domain/users/users.service';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { config } from '@app/config';

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
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, UserProp>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = await this.jwtService.verify(token, {
        secret: config.JWT_REFRESH.SECRET,
      });
      const userId = payload.sub;

      if (!userId) {
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

      console.log(
        `User ${userId} connected for notifications (socket ${client.id})`,
      );
    } catch (err) {
      console.error('Notification Gateway Connection Error:', err.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.getUserIdBySocketId(client.id);
    if (userId) {
      this.onlineUsers.delete(userId);
      await this.userService.updateOnlineStatus(userId);

      this.server.emit('user_status_offline', {
        userId,
        isOnline: false,
        offLineAt: new Date(),
      });

      console.log(
        `User ${userId} disconnected (notification socket ${client.id})`,
      );
    }
  }

  private getUserIdBySocketId(socketId: string): string | undefined {
    for (const [userId, user] of this.onlineUsers.entries()) {
      if (user.socketId === socketId) return userId;
    }
    return undefined;
  }

  @SubscribeMessage('send_notification')
  async handleSendNotification(@MessageBody() data: CreateNotificationDto) {
    const notification = await this.notificationService.create(data);

    console.log('Notification created and being sent to users');
    return { success: true };
  }
}
