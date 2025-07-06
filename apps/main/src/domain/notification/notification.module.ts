import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplate, User, UserNotification } from '@app/entity';
import { UploadModule } from '../upload/upload.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AppGateway } from '../gateway/src/app.gateway';
import { GateWayModule } from '../gateway/src/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, NotificationTemplate, UserNotification]),
    UploadModule,
    JwtModule,
    forwardRef(() => GateWayModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
