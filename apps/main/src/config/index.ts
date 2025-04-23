import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsOptional, validateSync } from 'class-validator';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

export class EnvironmentVariables {
  @IsOptional()
  APP_PORT: string;

  @IsOptional()
  APP_NAME: string;

  @IsNotEmpty()
  DATABASE_URL: string;

  @IsNotEmpty()
  DATABASE_HOST: string;

  @IsNotEmpty()
  DATABASE_USERNAME: string;

  @IsNotEmpty()
  DATABASE_PASSWORD: string;

  @IsNotEmpty()
  DATABASE_PORT: number;

  @IsNotEmpty()
  DATABASE_NAME: string;

  @IsNotEmpty()
  JWT_SECRET_KEY: string;

  @IsNotEmpty()
  JWT_EXPIRATION_TIME: number;

  @IsNotEmpty()
  PORT: number;

  @IsNotEmpty()
  AWS_S3_REGION: string;

  @IsNotEmpty()
  AWS_S3_ACCESS_KEY_ID: string;

  @IsNotEmpty()
  AWS_S3_SECRECT_ACCESS_KEY: string;

  @IsNotEmpty()
  STRIPE_PUBLIC_KEY: string;

  @IsNotEmpty()
  STRIPE_SECRECT_KEY: string;

  @IsNotEmpty()
  MAILDEV_INCOMING_PASS: string;

  @IsNotEmpty()
  MAILDEV_INCOMING_USER: string;

  @IsNotEmpty()
  JWT_SECRET_KEY_REFRESH: string;

  @IsNotEmpty()
  JWT_REFRESH_EXPIRATION_TIME: number;
}

export function validate(config: Record<string, unknown>) {
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

export const config = {
  APP_PORT: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 4000,
  APP_NAME: process.env.APP_NAME ?? 'main-service',
  DB_HOST: process.env.DATABASE_HOST ?? 'localhost',
  DB_USERNAME: process.env.DATABASE_USERNAME ?? 'user',
  DB_PASSWORD: process.env.DATABASE_PASSWORD ?? 'password',
  DB_PORT: parseInt(process.env.DATABASE_PORT, 10) ?? 5433,
  DB_NAME: process.env.DATABASE_NAME ?? 'glasses-store',
  JWT: {
    SECRET: process.env.JWT_SECRET_KEY ?? 'secret',
    EXPIRES_IN: process.env.JWT_EXPIRATION_TIME ?? 2592000,
    ISSUER: process.env.JWT_ISSUER ?? 'lunar-api.phat.com',
  },
  JWT_REFRESH: {
    SECRET: process.env.JWT_SECRET_KEY_REFRESH ?? 'very_serect',
    EXPIRES_IN: process.env.JWT_REFRESH_EXPIRATION_TIME ?? 2592000,
  },
  AWS_S3: {
    REGION: process.env.AWS_S3_REGION ?? 'us-east-1',
    SERECT_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY ?? '',
    ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID ?? '',
  },
  MAIL_DEV: {
    INCOMING_PASS: process.env.MAILDEV_INCOMING_PASS ?? '',
    INCOMING_USER: process.env.MAILDEV_INCOMING_USER ?? '',
  },
  STRIPE: {
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY ?? '',
    STRIPE_SERECT_KEY: process.env.STRIPE_SECRET_KEY ?? '',
  },
  GOOGLE: {
    GOOGLE_CUSTOMER_ID: process.env.GOOGLE_CUSTOMER_ID ?? '',
    GOOGLE_CUSTOMER_SERECT: process.env.GOOGLE_CUSTOMER_SECRET ?? '',
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL ?? '',
  },
};

