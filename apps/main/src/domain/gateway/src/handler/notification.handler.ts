import { CreateNotificationDto } from '@/domain/notification/dto/create-notification.dto';
import { FindNotificationDTO } from '@/domain/notification/dto/find-notification.dto';
import { UpdateNotificationDto } from '@/domain/notification/dto/update-notification.dto';
import { NotificationService } from '@/domain/notification/notification.service';
import { Server } from 'socket.io';

export class NotificationHandler {
  constructor(
    private server: Server,
    private notificationService: NotificationService,
  ) {}

  async handleSendNotification(data: CreateNotificationDto) {
    const notification = await this.notificationService.create(data);
    if (notification) {
      this.server.emit('get_notifications');
    }
    return { success: true };
  }

  async handleUpdateNotification(id: string, data: UpdateNotificationDto) {
    const updatedNotification = await this.notificationService.update(id, data);
    if (updatedNotification) {
      this.server.emit('get_notifications');
    }
    return { success: true };
  }

  async handleDeleteNotification(id: string) {
    await this.notificationService.remove(id);
    this.server.emit('get_notifications');
    return { success: true };
  }

  async handleReadNotification(data: {
    notificationId: string;
    userId: string;
  }) {
    await this.notificationService.updateStatus(
      data.notificationId,
      data.userId,
    );
    this.server.emit('notification_read', data);
  }

  async handleGetNotifications(findDTO: FindNotificationDTO, userId: string) {
    const notifications = await this.notificationService.findByUser(
      userId,
      findDTO,
    );
    return notifications;
  }
}
