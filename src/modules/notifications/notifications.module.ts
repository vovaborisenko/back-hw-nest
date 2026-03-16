import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { EmailManager } from './email.manager';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'v.borisenko.maxbit@gmail.com',
          pass: 'vmxipjzxklwagyya',
        },
      },
      defaults: {
        from: '"no-reply" <v.borisenko.maxbit@gmail.com>',
      },
    }),
  ],
  providers: [EmailService, EmailManager],
  exports: [EmailService],
})
export class NotificationsModule {}
