import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType, LogLevel } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppLogger } from './common/logger/app.logger';

async function bootstrap() {
  const appLogger = new AppLogger('Bootstrap');

  // Configure log levels based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const logLevels: LogLevel[] = isProduction
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'debug', 'verbose'];

  // Auth is backed by Supabase: every auth request needs these variables in
  // every environment. Without SUPABASE_ANON_KEY the apikey header is omitted
  // and Supabase rejects with "No API key found in request".
  const missingSupabaseVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'].filter((key) => !process.env[key]);
  if (missingSupabaseVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingSupabaseVars.join(', ')}. ` +
        'Get them from Supabase Dashboard > Project Settings > Data API / API Keys.',
    );
  }

  // These URLs must include the protocol: Supabase resolves a schemeless
  // redirect_to as a relative path on its own domain, which breaks OAuth.
  for (const key of ['API_PUBLIC_URL', 'FRONTEND_URL']) {
    const value = process.env[key];
    if (value && !/^https?:\/\//.test(value)) {
      throw new Error(`${key} must start with http:// or https:// (got "${value}").`);
    }
  }

  // Fail fast on misconfigured production deploys: these variables build the
  // OAuth callback URL and the post-login redirect, so a missing/localhost
  // value would silently send users to http://localhost in production.
  if (isProduction) {
    const misconfigured = ['API_PUBLIC_URL', 'FRONTEND_URL'].filter((key) => {
      const value = process.env[key];
      return !value || value.includes('localhost') || value.includes('127.0.0.1');
    });
    if (misconfigured.length > 0) {
      throw new Error(
        `Invalid production configuration: ${misconfigured.join(', ')} must be set to the public URLs ` +
          '(not localhost). API_PUBLIC_URL is used to build the OAuth callback URL and FRONTEND_URL ' +
          'for the post-login redirect.',
      );
    }
  }

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
    bufferLogs: true,
  });

  // Use our custom logger for all NestJS internal logging
  app.useLogger(appLogger);

  app.use(helmet());
  app.use(cookieParser());

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

