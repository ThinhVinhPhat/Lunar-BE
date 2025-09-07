import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplate, User, UserNotification } from '@app/entity';
import { UploadModule } from '../upload/upload.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { GateWayModule } from '../gateway/src/gateway.module';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, NotificationTemplate, UserNotification]),
    UploadModule,
    JwtModule,
    forwardRef(() => GateWayModule),
    forwardRef(() => UsersModule),
    forwardRef(() => CommonModule), // Assuming CommonModule is defined elsewhere
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
