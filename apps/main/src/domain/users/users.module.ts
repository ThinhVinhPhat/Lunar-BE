import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../../../../../libs/entity/src/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UploadModule } from '@/domain/upload/upload.module';
import { GateWayModule } from '@/domain/gateway/src/gateway.module';
import { AppGateway } from '@/domain/gateway/src/app.gateway';
import { MessageModule } from '../message/message.module';
import { NotificationModule } from '../notification/notification.module';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    JwtModule,
    UploadModule,
    GateWayModule,
    TypeOrmModule.forFeature([User]),
    forwardRef(() => GateWayModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => MessageModule),
    CommonModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService, AppGateway],
  exports: [UsersService],
})
export class UsersModule {}
