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
      const Link = "https://ogini-dev.vercel.app/";
    const mailOptionsSend = {
      from: `${from}`,
      to: receiverEmail,
      subject: `${subject}`,
      html: `<p>You have received a newsletter: <strong>Pls click on this link to see all the answers to your question${Link}</strong></p>
            `,
    };

    await this.transporter.sendMail(mailOptionsSend);
  }
}
