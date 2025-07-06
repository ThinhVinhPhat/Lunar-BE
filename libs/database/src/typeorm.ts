import {
  Category,
  CategoryDetail,
  Comment,
  Discount,
  Order,
  OrderDetail,
  Payment,
  Product,
  ProductCategory,
  UserDiscount,
  User,
  Favorite,
  MonthlyAnalytics,
  OrderHistory,
  OrderTracking,
  Shipment,
  Conversation,
  Message,
  NotificationTemplate,
  UserNotification,
} from '../../entity/src/index';
import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import * as process from 'process';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

export const config = {
  type: process.env?.DB_TYPE || 'postgres',
  host: process.env?.DATABASE_HOST || 'localhost',
  port: process.env?.DATABASE_PORT || 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    Category,
    CategoryDetail,
    Comment,
    Discount,
    OrderDetail,
    Order,
    Payment,
    ProductCategory,
    Product,
    User,
    Favorite,
    UserDiscount,
    MonthlyAnalytics,
    OrderHistory,
    OrderTracking,
    Shipment,
    Conversation,
    Message,
    NotificationTemplate,
    UserNotification,
  ],
  migrations: ['migrations/*{.ts,.js}'],
  migrationsRun: Boolean(process.env?.DATABASE_RUN_MIGRATIONS || false),
  autoLoadEntities: true,
  synchronize: false,
  logging: process.env?.DATABASE_DEBUG_MODE === 'true' || false,
  ssl: {
    rejectUnauthorized: false,
  },
};
if (config.logging) {
  console.log('Connect DB Successfully');
}
export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
