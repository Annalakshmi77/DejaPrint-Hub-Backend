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
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.logger.log('Mail service initialized with custom SMTP configuration.');
    } else {
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

  // ─────────────────────────────────────────────
  // HELPER: shared email sender
  // ─────────────────────────────────────────────
  private async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_FROM || 'DejaPrint Hub <dejaprinthub@gmail.com>',
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to} | Subject: ${subject}`);

      if (nodemailer.getTestMessageUrl(info)) {
        this.logger.log(`[PREVIEW EMAIL] URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return false;
    }
  }

  // ─────────────────────────────────────────────
  // ORDER CONFIRMATION (Customer + Admin)
  // ─────────────────────────────────────────────
  async sendOrderConfirmation(
    email: string,
    customerName: string,
    orderNumber: string,
  ): Promise<boolean> {
    const year = new Date().getFullYear();

    // --- Customer Email ---
    const customerHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #e6edf3; border-radius: 12px; overflow: hidden; border: 1px solid #30363d;">
        <div style="background-color: #161b22; padding: 30px; text-align: center; border-bottom: 1px solid #30363d;">
          <h1 style="margin: 0; color: #2d8a9e; font-size: 28px; letter-spacing: 1px;">
            DejaPrint <span style="color: #8b949e; font-weight: 400; font-size: 16px;">Hub</span>
          </h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; color: #ffffff; font-size: 22px;">🎉 Order Confirmed!</h2>
          <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
          <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">
            Thank you for choosing DejaPrint Hub. We have received your order and our design team will begin processing it shortly.
          </p>
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
                <td style="padding: 10px 0; text-align: right; color: #e3b341; font-weight: bold;">⏳ Pending Review</td>
              </tr>
            </table>
          </div>
          <p style="color: #8b949e; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
            You can track the live status of your production process anytime via your dashboard.
          </p>
        </div>
        <div style="background-color: #0d1117; padding: 20px; text-align: center; border-top: 1px solid #30363d;">
          <p style="color: #8b949e; font-size: 12px; margin: 0;">© ${year} DejaPrint Hub. All rights reserved.</p>
        </div>
      </div>
    `;

    // --- Admin Notification Email ---
    const adminHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #e6edf3; border-radius: 12px; overflow: hidden; border: 1px solid #30363d;">
        <div style="background-color: #161b22; padding: 30px; text-align: center; border-bottom: 1px solid #30363d;">
          <h1 style="margin: 0; color: #2d8a9e; font-size: 28px; letter-spacing: 1px;">
            DejaPrint <span style="color: #8b949e; font-weight: 400; font-size: 16px;">Hub — Admin</span>
          </h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; color: #ffffff; font-size: 22px;">📦 New Order Received</h2>
          <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">A new order has been placed and requires your review.</p>
          <div style="background-color: #161b22; border-radius: 8px; padding: 20px; margin: 30px 0; border: 1px solid #30363d;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #8b949e; font-weight: 600;">Order Number:</td>
                <td style="padding: 10px 0; text-align: right; color: #58a6ff; font-weight: bold; font-family: monospace; font-size: 16px;">${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8b949e; font-weight: 600;">Customer Name:</td>
                <td style="padding: 10px 0; text-align: right; color: #ffffff; font-weight: bold;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8b949e; font-weight: 600;">Customer Email:</td>
                <td style="padding: 10px 0; text-align: right; color: #58a6ff;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8b949e; font-weight: 600;">Status:</td>
                <td style="padding: 10px 0; text-align: right; color: #e3b341; font-weight: bold;">⏳ Pending Review</td>
              </tr>
            </table>
          </div>
          <p style="color: #8b949e; font-size: 14px; line-height: 1.5;">
            Please log in to the admin dashboard to review and process this order.
          </p>
        </div>
        <div style="background-color: #0d1117; padding: 20px; text-align: center; border-top: 1px solid #30363d;">
          <p style="color: #8b949e; font-size: 12px; margin: 0;">© ${year} DejaPrint Hub. All rights reserved.</p>
        </div>
      </div>
    `;

    const adminEmail = process.env.ADMIN_EMAIL || 'dejaprinthub@gmail.com';

    const [customerResult, adminResult] = await Promise.all([
      this.sendMail(email, `Order Confirmation - ${orderNumber}`, customerHtml),
      this.sendMail(adminEmail, `🆕 New Order Received - ${orderNumber}`, adminHtml),
    ]);

    return customerResult && adminResult;
  }

  // ─────────────────────────────────────────────
  // ORDER STATUS UPDATE (Customer)
  // ─────────────────────────────────────────────
  async sendOrderStatusUpdate(
    email: string,
    customerName: string,
    orderNumber: string,
    newStatus: string,
  ): Promise<boolean> {
    const year = new Date().getFullYear();

    const statusColor: Record<string, string> = {
      'Pending Review': '#e3b341',
      'In Production': '#58a6ff',
      'Quality Check': '#a371f7',
      'Dispatched': '#3fb950',
      'Delivered': '#3fb950',
      'Cancelled': '#f85149',
    };

    const color = statusColor[newStatus] || '#8b949e';

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #e6edf3; border-radius: 12px; overflow: hidden; border: 1px solid #30363d;">
        <div style="background-color: #161b22; padding: 30px; text-align: center; border-bottom: 1px solid #30363d;">
          <h1 style="margin: 0; color: #2d8a9e; font-size: 28px; letter-spacing: 1px;">
            DejaPrint <span style="color: #8b949e; font-weight: 400; font-size: 16px;">Hub</span>
          </h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; color: #ffffff; font-size: 22px;">🔄 Order Status Updated</h2>
          <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
          <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">
            Your order status has been updated. Here are the latest details:
          </p>
          <div style="background-color: #161b22; border-radius: 8px; padding: 20px; margin: 30px 0; border: 1px solid #30363d;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #8b949e; font-weight: 600;">Order Number:</td>
                <td style="padding: 10px 0; text-align: right; color: #58a6ff; font-weight: bold; font-family: monospace; font-size: 16px;">${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #8b949e; font-weight: 600;">New Status:</td>
                <td style="padding: 10px 0; text-align: right; color: ${color}; font-weight: bold;">${newStatus}</td>
              </tr>
            </table>
          </div>
          <p style="color: #8b949e; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
            Log in to your dashboard to view full order details and track progress.
          </p>
        </div>
        <div style="background-color: #0d1117; padding: 20px; text-align: center; border-top: 1px solid #30363d;">
          <p style="color: #8b949e; font-size: 12px; margin: 0;">© ${year} DejaPrint Hub. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendMail(email, `Order Update - ${orderNumber} is now "${newStatus}"`, html);
  }

  // ─────────────────────────────────────────────
  // EMAIL VERIFICATION
  // ─────────────────────────────────────────────
  async sendEmailVerification(
    email: string,
    customerName: string,
    verificationLink: string,
  ): Promise<boolean> {
    const year = new Date().getFullYear();

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #e6edf3; border-radius: 12px; overflow: hidden; border: 1px solid #30363d;">
        <div style="background-color: #161b22; padding: 30px; text-align: center; border-bottom: 1px solid #30363d;">
          <h1 style="margin: 0; color: #2d8a9e; font-size: 28px; letter-spacing: 1px;">
            DejaPrint <span style="color: #8b949e; font-weight: 400; font-size: 16px;">Hub</span>
          </h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; color: #ffffff; font-size: 22px;">✉️ Verify Your Email</h2>
          <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
          <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">
            Please verify your email address to activate your DejaPrint Hub account.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationLink}" style="background-color: #2d8a9e; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #8b949e; font-size: 13px; line-height: 1.5;">
            This link will expire in <strong>24 hours</strong>. If you did not create an account, you can safely ignore this email.
          </p>
        </div>
        <div style="background-color: #0d1117; padding: 20px; text-align: center; border-top: 1px solid #30363d;">
          <p style="color: #8b949e; font-size: 12px; margin: 0;">© ${year} DejaPrint Hub. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendMail(email, 'Verify your DejaPrint Hub email address', html);
  }

  // ─────────────────────────────────────────────
  // PASSWORD RESET
  // ─────────────────────────────────────────────
  async sendPasswordReset(
    email: string,
    customerName: string,
    resetLink: string,
  ): Promise<boolean> {
    const year = new Date().getFullYear();

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #e6edf3; border-radius: 12px; overflow: hidden; border: 1px solid #30363d;">
        <div style="background-color: #161b22; padding: 30px; text-align: center; border-bottom: 1px solid #30363d;">
          <h1 style="margin: 0; color: #2d8a9e; font-size: 28px; letter-spacing: 1px;">
            DejaPrint <span style="color: #8b949e; font-weight: 400; font-size: 16px;">Hub</span>
          </h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; color: #ffffff; font-size: 22px;">🔐 Reset Your Password</h2>
          <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
          <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to proceed.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}" style="background-color: #f85149; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #8b949e; font-size: 13px; line-height: 1.5;">
            This link will expire in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <div style="background-color: #0d1117; padding: 20px; text-align: center; border-top: 1px solid #30363d;">
          <p style="color: #8b949e; font-size: 12px; margin: 0;">© ${year} DejaPrint Hub. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendMail(email, 'Reset your DejaPrint Hub password', html);
  }
}