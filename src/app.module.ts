import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JobApplicationsModule } from './modules/job-applications/job-applications.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { ResumesModule } from './modules/resumes/resumes.module';
import { ResumeVariantsModule } from './modules/resume-variants/resume-variants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    JobApplicationsModule,
    InterviewsModule,
    ResumesModule,
    ResumeVariantsModule,
  ],

})
export class AppModule { }
