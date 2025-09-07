import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/entity/user.entity';
import { GoogleStrategy } from '@/domain/strategies/google.stategy';
import { AppGateway } from './app.gateway';

import {
  Conversation,
  Message,
  NotificationTemplate,
  UserNotification,
} from '@app/entity';
import { MessageHandler } from './handler/message.handler';
import { NotificationHandler } from './handler/notification.handler';
import { NotificationService } from '@/domain/notification/notification.service';
import { MessageService } from '@/domain/message/message.service';
import { UploadService } from '@/domain/upload/upload.service';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from '@/domain/notification/notification.module';
import { MessageModule } from '@/domain/message/message.module';
import { UsersModule } from '@/domain/users/users.module';
import { AuthModule } from '@/domain/auth/auth.module';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    TypeOrmModule.forFeature([
      User,
      Message,
      NotificationTemplate,
      UserNotification,
      Conversation,
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => MessageModule),
    forwardRef(() => CommonModule),
  ],
  providers: [
    AppGateway,
    GoogleStrategy,
    MessageHandler,
    NotificationHandler,
    NotificationService,
    MessageService,
    UploadService,
  ],
  exports: [MessageHandler, NotificationHandler, AppGateway],
})
export class GateWayModule {}
