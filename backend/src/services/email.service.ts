import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zoho.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await transporter.sendMail({
        from: `"Digital Fabrication Network" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });

      console.log('Email sent: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Welcome to Digital Fabrication Network!</h1>
        <p>Hello ${name},</p>
        <p>Thank you for joining Digital Fabrication Network. We're excited to have you as part of our community.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse and purchase components and materials</li>
          <li>Book fabrication services</li>
          <li>Collaborate on projects</li>
          <li>Connect with other makers and engineers</li>
        </ul>
        <p>Get started by completing your profile and exploring the platform.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
           style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Go to Dashboard
        </a>
        <p>Best regards,<br>The DFN Team</p>
      </div>
    `;

    return this.sendEmail(email, 'Welcome to Digital Fabrication Network', html);
  }

  async sendOrderConfirmation(email: string, orderId: number, orderDetails: any) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Order Confirmation</h1>
        <p>Your order #${orderId} has been confirmed.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Details:</h3>
          <p><strong>Item:</strong> ${orderDetails.itemName}</p>
          <p><strong>Quantity:</strong> ${orderDetails.quantity}</p>
          <p><strong>Total:</strong> $${orderDetails.totalPrice}</p>
        </div>
        <p>We'll notify you when your order ships.</p>
        <p>Best regards,<br>The DFN Team</p>
      </div>
    `;

    return this.sendEmail(email, `Order Confirmation #${orderId}`, html);
  }

  async sendBookingConfirmation(email: string, bookingId: number, bookingDetails: any) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Booking Confirmation</h1>
        <p>Your service booking #${bookingId} has been confirmed.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
          <p><strong>Date:</strong> ${bookingDetails.startDate}</p>
          <p><strong>Cost:</strong> $${bookingDetails.totalCost}</p>
        </div>
        <p>The service provider will contact you shortly.</p>
        <p>Best regards,<br>The DFN Team</p>
      </div>
    `;

    return this.sendEmail(email, `Booking Confirmation #${bookingId}`, html);
  }

  async sendQuoteNotification(email: string, quoteId: number, quoteDetails: any) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">New Quote Request</h1>
        <p>You have received a new quote request #${quoteId}.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Request Details:</h3>
          <p><strong>Service:</strong> ${quoteDetails.serviceName}</p>
          <p><strong>Description:</strong> ${quoteDetails.description}</p>
        </div>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/quotes/${quoteId}" 
           style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          View Quote Request
        </a>
        <p>Best regards,<br>The DFN Team</p>
      </div>
    `;

    return this.sendEmail(email, `New Quote Request #${quoteId}`, html);
  }

  async sendPasswordReset(email: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Password Reset Request</h1>
        <p>You requested to reset your password.</p>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The DFN Team</p>
      </div>
    `;

    return this.sendEmail(email, 'Password Reset Request', html);
  }
}

export default new EmailService();
