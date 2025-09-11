import { GlobalExceptionFilter } from '@app/filter';
import { createSwaggerDocument } from '@app/swagger/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';

export const setupApiServer = async ({
  app,
  appConfig,
}: {
  app: INestApplication;
  appConfig: {
    appName: string;
    appPort: number;
    globalPrefix?: string;
  };
  swaggerConfig?: {
    title: string;
    description: string;
    version: string;
  };
}) => {
  const config = app.get(ConfigService);
  const port = config.get('PORT');
  app.setGlobalPrefix('api/v1', { exclude: [''] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  const normalize = (url: string) => url?.replace(/\/$/, '').toLowerCase();

  const origins =
    process.env.ALLOWED_ORIGINS?.split(',').map((o) => normalize(o)) || [];

  app.enableCors({
    origin: (origin, callback) => {
      const cleanedOrigin = normalize(origin);

      console.log('✅ Allowed Origins:', origins);
      const allowUndefined = true;

      if (!origin && allowUndefined) {
        return callback(null, true);
      }

      const isAllowed = origins.includes(cleanedOrigin);
      console.log('🚀 Origin:', origin, '| Allowed:', isAllowed);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Access denied. Your IP or origin is not allowed.'));
      }
    },
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, x-api-key',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  SwaggerModule.setup('docs', app, createSwaggerDocument(app));
  await app.listen(port || 3100);

  console.table({
    appName: appConfig.appName,
    appPort: appConfig.appPort,
  });
};
