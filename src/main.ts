import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType, LogLevel } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppLogger } from './common/logger/app.logger';

async function bootstrap() {
  const appLogger = new AppLogger('Bootstrap');

  // Configure log levels based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const logLevels: LogLevel[] = isProduction
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'debug', 'verbose'];

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
    bufferLogs: true,
  });

  // Use our custom logger for all NestJS internal logging
  app.useLogger(appLogger);

  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL, 'http://localhost:3000']
      : ['http://localhost:3000'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Job Tracker API')
    .setDescription('Backend API for managing job applications, resumes, interviews, and reminders')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port, '0.0.0.0');

  // Detect deploy environment URLs dynamically
  let appUrl = `http://localhost:${port}`;

  appLogger.success(`API running on ${appUrl}/api`);
  appLogger.debug(`Swagger docs on ${appUrl}/api/docs`);
  appLogger.log(`Log level: ${logLevels.join(', ')} | Environment: ${process.env.NODE_ENV ?? 'development'}`);
}

void bootstrap();

