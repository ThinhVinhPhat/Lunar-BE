import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import { config } from '@app/config';

import { UsersService } from '@/domain/users/users.service';
import { NotificationHandler } from './handler/notification.handler';
import { MessageHandler } from './handler/message.handler';
import { NotificationService } from '@/domain/notification/notification.service';
import { MessageService } from '@/domain/message/message.service';
import { FindNotificationDTO } from '@/domain/notification/dto/find-notification.dto';

export type UserProp = {
  socketId: string;
  connectedAt: number;
  isOnline: boolean;
};

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger;
  private onlineUsers = new Map<string, UserProp>();
  private notificationHandler: NotificationHandler;
  private messageHandler: MessageHandler;

  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
  ) {
    this.logger = new Logger(AppGateway.name);
  }

  afterInit() {
    this.notificationHandler = new NotificationHandler(
      this.server,
      this.notificationService,
    );
    this.messageHandler = new MessageHandler(this.server, this.messageService);
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;

      const payload = await this.jwtService.verify(token, {
        secret: config.JWT_REFRESH.SECRET,
      });
      const userId = payload.sub;

      if (!userId) return client.disconnect();

      this.onlineUsers.set(userId, {
        socketId: client.id,
        connectedAt: Date.now(),
        isOnline: true,
      });

      await this.userService.updateOnlineStatus(userId);

      console.log('User connected:', userId, 'Socket ID:', client.id);

      this.server.emit('user_status_online', { userId, isOnline: true });
    } catch (err) {
      console.log('Connection error:', err.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.getUserIdBySocketId(client.id);
    if (userId) {
      this.onlineUsers.delete(userId);
      await this.userService.updateOnlineStatus(userId);
      this.server.emit('user_status_offline', { userId, isOnline: false });
    }
  }

  getUserOnline(userId: string): UserProp {
    const user = this.onlineUsers.get(userId);
    return user ? user : null;
  }

  private getUserIdBySocketId(socketId: string): string | undefined {
    for (const [userId, info] of this.onlineUsers.entries()) {
      if (info.socketId === socketId) return userId;
    }
    return undefined;
  }

  // ================= Notification =================
  @SubscribeMessage('get_notifications_by_user')
  async getNotifications(
    @MessageBody() findDTO: FindNotificationDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.jwtService.verifyAsync(client.handshake.auth.token);
    const data = await this.notificationService.findByUser(user.id, findDTO);
    client.emit('notifications_by_user', data);
  }

  @SubscribeMessage('read_notification')
  async readNotification(@MessageBody() data: any) {
    return this.notificationHandler.handleReadNotification(data);
  }

  // ================= Message =================

  @SubscribeMessage('send_message')
  async sendMessage(@MessageBody() data: any) {
    return this.messageHandler.handleSendMessage(data, this.onlineUsers);
  }
}
