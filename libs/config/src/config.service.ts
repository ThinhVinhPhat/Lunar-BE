import { Injectable } from '@nestjs/common';
import { ConfigData } from './config.interface';
import { defaultConfig } from './confiig.default';
import { plainToInstance } from 'class-transformer';
import { EnvironmentVariables } from '.';
import { validateSync } from 'class-validator';

@Injectable()
export class ConfigService {
  private config: ConfigData;

  constructor(data: ConfigData = defaultConfig) {
    this.config = data;
  }

  public loadFromEnv() {
    this.config = this.parseConfigFromEnv(process.env);
  }

  private parseConfigFromEnv(env: NodeJS.ProcessEnv): ConfigData {
    return {
      app: {
        port: Number(env.PORT),
        name: env.APP_NAME,
      },
      DB: {
        DB_HOST: env.DATABASE_HOST,
        DB_USERNAME: env.DATABASE_USERNAME,
        DB_PASSWORD: env.DATABASE_PASSWORD,
        DB_PORT: Number(env.DATABASE_PORT),
        DB_NAME: env.DATABASE_NAME,
        // DB_URL: env.DATABASE_URL,
        DATABASE_DEBUG_MODE: env.DATABASE_DEBUG_MODE === 'true' || false,
      },
      JWT: {
        SECRET: env.JWT_SECRET_KEY,
        EXPIRES_IN: Number(env.JWT_EXPIRATION_TIME),
        ISSUER: env.JWT_ISSUER,
      },
      JWT_REFRESH: {
        SECRET: env.JWT_SECRET_KEY_REFRESH,
        EXPIRES_IN: Number(env.JWT_REFRESH_EXPIRATION_TIME),
      },
      AWS_S3: {
        REGION: env.AWS_S3_REGION,
        SERECT_ACCESS_KEY: env.AWS_S3_SECRET_ACCESS_KEY,
        ACCESS_KEY_ID: env.AWS_S3_ACCESS_KEY_ID,
      },
      MAIL_DEV: {
        INCOMING_PASS: env.MAILDEV_INCOMING_PASS,
        INCOMING_USER: env.MAILDEV_INCOMING_USER,
      },
      STRIPE: {
        STRIPE_PUBLIC_KEY: env.STRIPE_PUBLIC_KEY,
        STRIPE_SERECT_KEY: env.STRIPE_SECRET_KEY,
        ENDPOINT_SERECT: env.ENDPOINT_SECRET,
      },
      GOOGLE: {
        GOOGLE_CUSTOMER_ID: env.GOOGLE_CUSTOMER_ID,
        GOOGLE_CUSTOMER_SECRET: env.GOOGLE_CUSTOMER_SECRET,
        GOOGLE_CALLBACK_URL: env.GOOGLE_CALLBACK_URL,
      },
    };
  }

  public validate(config: Record<string, unknown>) {
    const validateConfig = plainToInstance(EnvironmentVariables, config, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(validateConfig, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    return validateConfig;
  }

  public get<T>(key: keyof ConfigData): T {
    return this.config[key] as unknown as T;
  }
}
