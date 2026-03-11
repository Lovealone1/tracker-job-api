import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    JobApplicationsModule,
    InterviewsModule,
    ResumesModule,
    ResumeVariantsModule,
    MailModule,
    RemindersModule,
    UsersModule,
  ],

})
export class AppModule { }
