import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JobApplicationsModule } from './modules/job-applications/job-applications.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { ResumesModule } from './modules/resumes/resumes.module';
import { ResumeVariantsModule } from './modules/resume-variants/resume-variants.module';
import { MailModule } from './modules/mail/mail.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { UsersModule } from './modules/users/users.module';
import { LoggerModule } from './common/logger/logger.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    LoggerModule,
    AuthModule,
    JobApplicationsModule,
    InterviewsModule,
    ResumesModule,
    ResumeVariantsModule,
    MailModule,
    RemindersModule,
    UsersModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // CorrelationIdMiddleware runs before guards/interceptors on all routes
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}

