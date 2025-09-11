import { ConfigData } from './config.interface';

export const defaultConfig: ConfigData = {
  app: {
    port: 3100,
    name: 'main-service',
  },

  DB: {
    DB_HOST: 'localhost',
    DB_USERNAME: 'user',
    DB_PASSWORD: 'password',
    DB_PORT: 5433,
    DB_NAME: 'glasses-store',
    DATABASE_DEBUG_MODE: false,
  },

  JWT: {
    SECRET: 'secret',
    EXPIRES_IN: 2592000,
    ISSUER: 'lunar-api.phat.com',
  },
  JWT_REFRESH: {
    SECRET: 'very_serect',
    EXPIRES_IN: 2592000,
  },
  AWS_S3: {
    REGION: 'us-east-1',
    SERECT_ACCESS_KEY: '',
    ACCESS_KEY_ID: '',
  },
  MAIL_DEV: {
    INCOMING_PASS: '',
    INCOMING_USER: '',
  },
  STRIPE: {
    STRIPE_PUBLIC_KEY: '',
    STRIPE_SERECT_KEY:
      'sk_test_51OGcQMDyUwWGhw9iBUBwO52bjgjFen1MJ4o2mH2hwQKjVgzrKpMOTLAOS7SWGifYYVRNfpYuNzkU5FaRLkHyrH4e001nk61hbk',
    ENDPOINT_SERECT:
      'whsec_3dcc9f7805a6a99f7c98e5ad0ac364477abad1ce077095863676b43c00020784',
  },
  GOOGLE: {
    GOOGLE_CUSTOMER_ID: '',
    GOOGLE_CUSTOMER_SECRET: '',
    GOOGLE_CALLBACK_URL: '',
  },
};
