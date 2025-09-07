import { NotificationType } from '@app/constant';
import { Respond } from '..';
import { NotificationRespondDto } from '@/domain/notification/dto/notification.resspond.dto';

export interface userNotification {
  notification: Notification;
  userId: string;
  isRead: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  image?: string[];
  type: NotificationType;
  targetRoles?: string[];
}

export interface GetAllNotificationResponse extends Respond {
  data: NotificationRespondDto;
}

export interface GetNotificationResponse extends Respond {
  data: NotificationRespondDto;
}

export interface CreateNotificationResponse extends Respond {
  data: NotificationRespondDto;
}

export interface UpdateNotificationResponse extends Respond {
  data: NotificationRespondDto;
}
