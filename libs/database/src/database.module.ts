import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DbConfigError } from './database.error';
import { DbConfig } from './database.interface';
import { DBConfig } from '@app/config/config.interface';
import { ConfigService } from '@app/config/config.service';
import { AppConfigModule } from '@app/config/config.module';

@Module({})
export class DatabaseModule {
  private static getConnectionOptions(
    config: ConfigService,
    dbconfig: DbConfig,
  ): TypeOrmModuleOptions {
    const dbdata = config.get<DBConfig>('DB');
    if (!dbdata) {
      throw new DbConfigError('Database config is missing');
    }
    const connectionOptions =
      DatabaseModule.getConnectionOptionsPostgres(dbdata);
    return {
      ...connectionOptions,
      entities: dbconfig.entities,
      synchronize: false,
      logging: false,
    };
  }

  private static getConnectionOptionsPostgres(
    dbData: DBConfig,
  ): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: dbData.DB_HOST || 'localhost',
      port: dbData.DB_PORT,
      username: dbData.DB_USERNAME,
      password: dbData.DB_PASSWORD,
      database: dbData.DB_NAME,
      migrations: ['migrations/*{.ts,.js}'],
      migrationsRun: false,
      autoLoadEntities: true,
      synchronize: false,
      logging: dbData.DATABASE_DEBUG_MODE === true || false,
      keepConnectionAlive: true,
      ssl:
        process.env.NODE_ENV !== 'local' && process.env.NODE_ENV !== 'test'
          ? { rejectUnauthorized: false }
          : false,
    };
  }

  public static forRoot(dbConfig: DbConfig): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [AppConfigModule],
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          useFactory: (configService: ConfigService, logger: Logger) =>
            DatabaseModule.getConnectionOptions(configService, dbConfig),
          inject: [ConfigService],
        }),
      ],
      controllers: [],
      providers: [],
      exports: [],
    };
  }
}
