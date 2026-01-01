// Email Service for Booking Notifications

export interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  salonName: string;
  salonAddress: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  totalAmount: number;
  bookingId: string;
}

export const sendBookingConfirmationEmail = async (data: BookingEmailData) => {
  try {
    const response = await fetch('/api/email/booking-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send confirmation email');
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

export const sendBookingReminderEmail = async (data: BookingEmailData) => {
  try {
    const response = await fetch('/api/email/booking-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send reminder email');
    }

    return { success: true };
  } catch (error) {
    console.error('Reminder email failed:', error);
    return { success: false, error };
  }
};

// Email Templates
export const getBookingConfirmationTemplate = (data: BookingEmailData) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
    .detail-value { color: #333; }
    .total { font-size: 20px; font-weight: bold; color: #8B5CF6; }
    .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Booking Confirmed!</h1>
      <p>Your appointment has been successfully booked</p>
    </div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>Thank you for booking with <strong>${data.salonName}</strong>. Your appointment is confirmed!</p>
      
      <div class="booking-details">
        <h3>Booking Details</h3>
        <div class="detail-row">
          <span class="detail-label">Booking ID:</span>
          <span class="detail-value">${data.bookingId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">${data.serviceName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${data.bookingDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${data.bookingTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Location:</span>
          <span class="detail-value">${data.salonAddress}</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Total Amount:</span>
          <span class="detail-value total">₹${data.totalAmount}</span>
        </div>
      </div>

      <p><strong>⏰ Important:</strong> Please arrive 10 minutes before your scheduled time.</p>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-bookings" class="button">View My Bookings</a>
      </div>

      <p>If you need to reschedule or cancel, please contact the salon directly or manage it through your bookings page.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SalonHub. All rights reserved.</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
};
