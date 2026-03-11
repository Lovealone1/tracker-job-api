import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { RemindersRepository } from './reminders.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { MailModule } from '../mail/mail.module';
import { RemindersCronService } from './reminders.cron.service';

@Module({
  imports: [MailModule],
  controllers: [RemindersController],
  providers: [RemindersService, RemindersRepository, PrismaService, RemindersCronService],
  exports: [RemindersService],
})
export class RemindersModule {}
