import { Module, Type } from '@nestjs/common';
import { validate } from '../../config/src/index';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from '../../database/src/typeorm/typeorm';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@app/database/database.module';
import * as Entities from '@app/entity';

export const ALL_ENTITIES: Type<any>[] = Object.values(Entities).filter(
  (e) => typeof e === 'function', // giữ lại class
);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
      validate,
      envFilePath: ['.env', '.env.example'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: configService.get('MAILDEV_INCOMING_USER'),
            pass: configService.get('MAILDEV_INCOMING_PASS'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },

        template: {
          dir: process.cwd() + '/libs/mail/src',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    // TypeOrmModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) =>
    //     configService.getOrThrow('typeorm'),
    // }),
    DatabaseModule.forRoot({ entities: [...ALL_ENTITIES] }),
  ],
  exports: [MailerModule, ConfigModule, ThrottlerModule, DatabaseModule],
})
export class SharedModule {}
