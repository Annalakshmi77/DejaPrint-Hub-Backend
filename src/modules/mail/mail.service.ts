import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  async onModuleInit() {
    await this.initTransporter();
  }

  private async initTransporter() {
    // If we have SMTP settings in environment, use them (Production ready)
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.logger.log('Mail service initialized with custom SMTP configuration.');
    } else {
      // Fallback for development: Auto-generate Ethereal account
      this.logger.log('No SMTP configuration found. Generating Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(`Ethereal test account generated: ${testAccount.user}`);
    }
  }

  async sendOrderConfirmation(email: string, customerName: string, orderNumber: string) {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #e6edf3; border-radius: 12px; overflow: hidden; border: 1px solid #30363d;">
        <!-- Header -->
        <div style="background-color: #161b22; padding: 30px; text-align: center; border-bottom: 1px solid #30363d;">
          <h1 style="margin: 0; color: #2d8a9e; font-size: 28px; letter-spacing: 1px;">PrintCraft <span style="color: #8b949e; font-weight: 400; font-size: 16px;">Studio</span></h1>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; color: #ffffff; font-size: 22px;">Order Confirmed!</h2>
          <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">Hello ${customerName},</p>
          <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">Thank you for choosing PrintCraft. We have received your order and our design team will begin processing it shortly.</p>
          
          <div style="background-color: #161b22; border-radius: 8px; padding: 20px; margin: 30px 0; border: 1px solid #30363d;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #8b949e; font-weight: 600;">Order Number:</td>
                <td style="padding: 10px 0; text-align: right; color: #58a6ff; font-weight: bold; font-family: monospace; font-size: 16px;">${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8b949e; font-weight: 600;">Pricing & Quote:</td>
                <td style="padding: 10px 0; text-align: right; color: #ffffff; font-weight: bold;">To Be Discussed</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8b949e; font-weight: 600;">Status:</td>
                <td style="padding: 10px 0; text-align: right; color: #e3b341; font-weight: bold;">Pending Review</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #8b949e; font-size: 14px; line-height: 1.5; margin-bottom: 0;">You can track the live status of your production process anytime via your dashboard.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #0d1117; padding: 20px; text-align: center; border-top: 1px solid #30363d;">
          <p style="color: #8b949e; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} PrintCraft Studio. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_FROM || '"PrintCraft Studio" <orders@printcraft.com>',
        to: email,
        subject: `Order Confirmation - ${orderNumber}`,
        html: htmlContent,
      });

      this.logger.log(`Order confirmation email sent to ${email}`);
      
      // If using ethereal email, log the URL to preview the email
      if (info.messageId && nodemailer.getTestMessageUrl(info)) {
        this.logger.log(`[PREVIEW EMAIL] URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send order confirmation email to ${email}`, error);
      return false;
    }
  }
}
