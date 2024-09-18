// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnswerMailServiceWithImg {
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

  async sendAnswerToEnquirerWithImg(enquirerEmail:string, imageUrl:[], questionTitle: string, text: string) {
   
    const mailOptionsSend = {
      from: 'Oginibe Answer-Mail service',
      to: enquirerEmail,
      subject: `Answer to your question: ${questionTitle}`,
      html: `<p>You have received a new answer to your question: <strong>${questionTitle}</strong></p>
             <p>Answer: ${text}</p>
             <p>Answer Images: ${imageUrl} </p>`
    };

    await this.transporter.sendMail(mailOptionsSend);
  }
}
