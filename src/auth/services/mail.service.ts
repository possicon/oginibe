// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
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

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `https://ogini-dev.vercel.app/reset-password?token=${token}`;
    const mailOptions = {
      from: 'Oginibe Auth-backend service',
      to: to,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click on the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
  async signupMail(email: string, firstName: string, lastName: string) {
    const mailOptions = {
      from: 'Oginibe App <noreply@yourapp.com>',
      to: email,
      subject: 'Signup Successful - Welcome to Oginibe App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dddddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="text-align: center; color: #333333;">Welcome to Oginibe App!</h2>
          <p style="font-size: 16px; color: #555555;">
            Dear ${firstName} ${lastName},
          </p>
          <p style="font-size: 16px; color: #555555;">
            We're excited to have you on board. Your signup was successful, and you're now part of the Oginibe community!
          </p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://ogini-dev.vercel.app/" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 5px;">
              Go to Dashboard
            </a>
          </div>
          <hr style="border-top: 1px solid #dddddd; margin-top: 30px; margin-bottom: 20px;" />
          <p style="font-size: 14px; color: #777777;">
            Share & Grow your knowledge with us!
          </p>
          <p style="font-size: 14px; color: #777777;">
            Thank you for choosing Oginibe App!
          </p>
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999999;">
            &copy; ${new Date().getFullYear()} Oginibe App. All rights reserved.
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
