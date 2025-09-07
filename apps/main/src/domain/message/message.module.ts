import { forwardRef, Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Message, User } from '@app/entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '@/domain/users/users.module';
import { MessagesController } from './message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User, Conversation]),
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET_KEY'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRATION_TIME'),
          },
        };
      },
      inject: [ConfigService],
    }),
    forwardRef(() => UsersModule),
  ],
  controllers: [MessagesController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
