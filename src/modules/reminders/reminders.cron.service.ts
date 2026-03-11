import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class RemindersCronService {
  private readonly logger = new Logger(RemindersCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running recurring check for pending reminders...');

    const now = new Date();

    try {
      // 1. Find all PENDING reminders where dueAt has arrived or passed
      const pendingReminders = await this.prisma.reminder.findMany({
        where: {
          status: 'PENDING',
          dueAt: { lte: now },
        },
        include: {
          profile: true,
        },
      });

      if (pendingReminders.length === 0) {
        return;
      }

      this.logger.log(`Found ${pendingReminders.length} pending reminders to process.`);

      // 2. Process each reminder
      for (const reminder of pendingReminders) {
        if (!reminder.profile || !reminder.profile.email) {
          this.logger.warn(`Reminder ${reminder.id} has no valid profile email. Skipping.`);
          continue;
        }

        // 3. Send the email
        const htmlContent = `
          <h2>Reminder: ${reminder.title}</h2>
          <p><strong>Type:</strong> ${reminder.type}</p>
          <p><strong>Due Date:</strong> ${reminder.dueAt.toLocaleString()}</p>
          ${reminder.description ? `<p><strong>Description:</strong> ${reminder.description}</p>` : ''}
          <p><br />This is an automated reminder from Job Tracker.</p>
        `;

        try {
          await this.mailService.sendMail({
            to: reminder.profile.email,
            subject: `Job Tracker Reminder: ${reminder.title}`,
            html: htmlContent,
          });

          // 4. Update the reminder status to COMPLETED
          await this.prisma.reminder.update({
            where: { id: reminder.id },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(), // Set completedAt to the current execution date
            },
          });

          this.logger.log(`Successfully processed and emailed reminder ${reminder.id}`);
        } catch (emailError) {
          this.logger.error(`Failed to execute processing for reminder ${reminder.id}`, emailError);
        }
      }
    } catch (error) {
      this.logger.error('Error occurring during the reminders cron job execution.', error);
    }
  }
}
