import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../../../../../libs/entity/src/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UploadModule } from '@/domain/upload/upload.module';
import { MessageModule } from '../message/src/message.module';

@Module({
  imports: [
    JwtModule,
    UploadModule,
    TypeOrmModule.forFeature([User]),
    forwardRef(() => MessageModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
