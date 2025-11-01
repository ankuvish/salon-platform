// Notification service for Email, SMS, and WhatsApp
// This is a placeholder implementation - integrate with actual services in production

export type NotificationType = "email" | "sms" | "whatsapp";

export interface NotificationPayload {
  to: string; // email or phone number
  type: NotificationType;
  subject?: string;
  message: string;
  templateData?: Record<string, any>;
}

export interface BookingNotificationData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  salonName: string;
  serviceName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingId: string;
}

class NotificationService {
  /**
   * Send booking confirmation notification
   */
  async sendBookingConfirmation(data: BookingNotificationData) {
    const message = `Hi ${data.customerName}! Your appointment at ${data.salonName} has been confirmed for ${data.bookingDate} at ${data.startTime}. Service: ${data.serviceName}. Booking ID: ${data.bookingId}`;

    // Send via multiple channels
    await Promise.all([
      this.sendEmail({
        to: data.customerEmail,
        type: "email",
        subject: "Booking Confirmation - SalonBook",
        message,
        templateData: data,
      }),
      this.sendSMS({
        to: data.customerPhone,
        type: "sms",
        message,
      }),
      this.sendWhatsApp({
        to: data.customerPhone,
        type: "whatsapp",
        message,
      }),
    ]);
  }

  /**
   * Send booking reminder (24 hours before)
   */
  async sendBookingReminder(data: BookingNotificationData) {
    const message = `Reminder: You have an appointment tomorrow at ${data.salonName} on ${data.bookingDate} at ${data.startTime}. See you there!`;

    await Promise.all([
      this.sendEmail({
        to: data.customerEmail,
        type: "email",
        subject: "Appointment Reminder - SalonBook",
        message,
        templateData: data,
      }),
      this.sendSMS({
        to: data.customerPhone,
        type: "sms",
        message,
      }),
      this.sendWhatsApp({
        to: data.customerPhone,
        type: "whatsapp",
        message,
      }),
    ]);
  }

  /**
   * Send booking cancellation notification
   */
  async sendBookingCancellation(data: BookingNotificationData) {
    const message = `Your appointment at ${data.salonName} scheduled for ${data.bookingDate} at ${data.startTime} has been cancelled. Booking ID: ${data.bookingId}`;

    await Promise.all([
      this.sendEmail({
        to: data.customerEmail,
        type: "email",
        subject: "Booking Cancelled - SalonBook",
        message,
        templateData: data,
      }),
      this.sendSMS({
        to: data.customerPhone,
        type: "sms",
        message,
      }),
    ]);
  }

  /**
   * Send booking reschedule notification
   */
  async sendBookingReschedule(data: BookingNotificationData & { oldDate: string; oldTime: string }) {
    const message = `Your appointment at ${data.salonName} has been rescheduled from ${data.oldDate} at ${data.oldTime} to ${data.bookingDate} at ${data.startTime}. Booking ID: ${data.bookingId}`;

    await Promise.all([
      this.sendEmail({
        to: data.customerEmail,
        type: "email",
        subject: "Booking Rescheduled - SalonBook",
        message,
        templateData: data,
      }),
      this.sendSMS({
        to: data.customerPhone,
        type: "sms",
        message,
      }),
    ]);
  }

  /**
   * Send email notification
   * TODO: Integrate with SendGrid, Resend, or similar service
   */
  private async sendEmail(payload: NotificationPayload) {
    try {
      console.log("[Email Notification]", {
        to: payload.to,
        subject: payload.subject,
        message: payload.message,
      });

      // In production, integrate with email service:
      // const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     personalizations: [{ to: [{ email: payload.to }] }],
      //     from: { email: process.env.FROM_EMAIL },
      //     subject: payload.subject,
      //     content: [{ type: "text/plain", value: payload.message }],
      //   }),
      // });

      return { success: true, type: "email" };
    } catch (error) {
      console.error("Email notification failed:", error);
      return { success: false, type: "email", error };
    }
  }

  /**
   * Send SMS notification
   * TODO: Integrate with Twilio or similar service
   */
  private async sendSMS(payload: NotificationPayload) {
    try {
      console.log("[SMS Notification]", {
        to: payload.to,
        message: payload.message,
      });

      // In production, integrate with Twilio:
      // const response = await fetch(
      //   `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      //   {
      //     method: "POST",
      //     headers: {
      //       Authorization: `Basic ${Buffer.from(
      //         `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      //       ).toString("base64")}`,
      //       "Content-Type": "application/x-www-form-urlencoded",
      //     },
      //     body: new URLSearchParams({
      //       To: payload.to,
      //       From: process.env.TWILIO_PHONE_NUMBER!,
      //       Body: payload.message,
      //     }),
      //   }
      // );

      return { success: true, type: "sms" };
    } catch (error) {
      console.error("SMS notification failed:", error);
      return { success: false, type: "sms", error };
    }
  }

  /**
   * Send WhatsApp notification
   * TODO: Integrate with Twilio WhatsApp Business API or WhatsApp Cloud API
   */
  private async sendWhatsApp(payload: NotificationPayload) {
    try {
      console.log("[WhatsApp Notification]", {
        to: payload.to,
        message: payload.message,
      });

      // In production, integrate with WhatsApp Business API:
      // const response = await fetch(
      //   `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      //   {
      //     method: "POST",
      //     headers: {
      //       Authorization: `Basic ${Buffer.from(
      //         `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      //       ).toString("base64")}`,
      //       "Content-Type": "application/x-www-form-urlencoded",
      //     },
      //     body: new URLSearchParams({
      //       To: `whatsapp:${payload.to}`,
      //       From: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      //       Body: payload.message,
      //     }),
      //   }
      // );

      return { success: true, type: "whatsapp" };
    } catch (error) {
      console.error("WhatsApp notification failed:", error);
      return { success: false, type: "whatsapp", error };
    }
  }
}

export const notificationService = new NotificationService();