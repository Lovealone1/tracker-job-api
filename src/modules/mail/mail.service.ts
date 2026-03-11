import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly defaultFrom: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.defaultFrom = this.configService.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';
  }

  async sendMail(options: SendMailOptions) {
    try {
      const data = await this.resend.emails.send({
        from: this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(`Email sent successfully: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      this.logger.error(`Error sending email`, error);
      throw error;
    }
  }
}
