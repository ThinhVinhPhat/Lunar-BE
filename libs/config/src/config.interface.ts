/**
 * Configuration for the database connection.
 */
export interface AppConfig {
  port: number;
  name: string;
}

export interface DBConfig {
  DB_HOST: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_URL?: string;
  DATABASE_DEBUG_MODE: boolean;
}

export interface JWTConfig {
  SECRET: string;
  EXPIRES_IN: number;
  ISSUER: string;
}

export interface JWTRefreshConfig {
  SECRET: string;
  EXPIRES_IN: number;
}

export interface AWSConfig {
  REGION: string;
  SERECT_ACCESS_KEY: string;
  ACCESS_KEY_ID: string;
}

export interface MailDevConfig {
  INCOMING_PASS: string;
  INCOMING_USER: string;
}

export interface StripeConfig {
  STRIPE_PUBLIC_KEY: string;
  STRIPE_SERECT_KEY: string;
  ENDPOINT_SERECT: string;
}

export interface GoogleConfig {
  GOOGLE_CUSTOMER_ID: string;
  GOOGLE_CUSTOMER_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
}

export interface ConfigData {
  app: AppConfig;
  DB: DBConfig;
  JWT: JWTConfig;
  JWT_REFRESH: JWTRefreshConfig;
  AWS_S3: AWSConfig;
  MAIL_DEV: MailDevConfig;
  STRIPE: StripeConfig;
  GOOGLE: GoogleConfig;
}
