import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    })
  }

  async sendOrderConfirmation(email: string, name: string, orderNumber: string, total: number) {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: `Order Confirmed — ${orderNumber} | PrintCraft`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#2563eb">Order Confirmed! 🎉</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
            <p>Total: <strong>₹${total}</strong></p>
            <p>We'll notify you when your order moves to the next stage.</p>
            <hr/>
            <p style="color:#888;font-size:12px">PrintCraft — Custom Printing Solutions</p>
          </div>`,
      })
      this.logger.log(`Order confirmation sent to ${email}`)
    } catch (err) {
      this.logger.error(`Failed to send email to ${email}`, err)
    }
  }

  async sendOrderStatusUpdate(email: string, name: string, orderNumber: string, status: string) {
    const statusMessages: Record<string, string> = {
      confirmed: 'Your order has been confirmed and is being processed.',
      designing: 'Our design team is working on your order.',
      printing: 'Your order is now in the printing stage.',
      dispatched: 'Your order has been dispatched and is on its way!',
      delivered: 'Your order has been delivered. We hope you love it!',
      cancelled: 'Your order has been cancelled.',
    }
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: `Order ${orderNumber} — Status Update | PrintCraft`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#2563eb">Order Update</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>${statusMessages[status] || `Your order status is now: ${status}`}</p>
            <p>Order Number: <strong>${orderNumber}</strong></p>
            <hr/>
            <p style="color:#888;font-size:12px">PrintCraft — Custom Printing Solutions</p>
          </div>`,
      })
    } catch (err) {
      this.logger.error(`Failed to send status email`, err)
    }
  }

  async sendDesignReviewNotification(email: string, name: string, orderNumber: string, status: 'approved' | 'rejected', notes?: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: `Design ${status === 'approved' ? 'Approved ✅' : 'Needs Changes ⚠️'} — ${orderNumber} | PrintCraft`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:${status === 'approved' ? '#16a34a' : '#dc2626'}">
              Design ${status === 'approved' ? 'Approved' : 'Needs Changes'}
            </h2>
            <p>Hi <strong>${name}</strong>, your design for order <strong>${orderNumber}</strong> has been ${status}.</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            <hr/>
            <p style="color:#888;font-size:12px">PrintCraft</p>
          </div>`,
      })
    } catch (err) {
      this.logger.error(`Failed to send design review email`, err)
    }
  }
}
