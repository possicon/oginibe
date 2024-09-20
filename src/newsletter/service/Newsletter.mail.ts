// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NewsletterMailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      // host: 'smtp.ethereal.email',
      // port: 587,
      auth: {
        user: 'djnchrys@gmail.com',
        pass: 'mictdtqklnuerfkg',
      },
    });
  }

  async sendNewsletterToUserEmail(receiverEmail:string,
    subject:string,
    content:string,
    from:string) {
   
    const mailOptionsSend = {
      from: `${from}`,
      to: receiverEmail,
      subject: `${subject}`,
      html: `<p>You have received a newsletter: <strong>${content}</strong></p>
            `,
    };

    await this.transporter.sendMail(mailOptionsSend);
  }
}
