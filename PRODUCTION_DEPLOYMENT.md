# Production Deployment Guide

## Prerequisites Checklist

### 1. Payment Gateway Setup (Razorpay)
- [ ] Sign up at https://razorpay.com
- [ ] Complete KYC verification
- [ ] Get API keys (Key ID & Secret)
- [ ] Add webhook URL: `https://yourapp.com/api/webhooks/razorpay`
- [ ] Test in test mode first
- [ ] Switch to live mode after testing

**Cost:** 2% per transaction + GST

### 2. Email Service Setup (Choose One)

#### Option A: SendGrid (Recommended)
- [ ] Sign up at https://sendgrid.com
- [ ] Verify sender email/domain
- [ ] Create API key with "Mail Send" permission
- [ ] Set up email templates
- [ ] Configure SPF/DKIM records

**Cost:** Free up to 100 emails/day, then $15/month for 40k emails

#### Option B: AWS SES
- [ ] Create AWS account
- [ ] Request production access (takes 24-48 hours)
- [ ] Verify email/domain
- [ ] Create IAM user with SES permissions
- [ ] Configure DKIM

**Cost:** $0.10 per 1000 emails

### 3. Error Tracking (Sentry)
- [ ] Sign up at https://sentry.io
- [ ] Create new project (Next.js)
- [ ] Copy DSN
- [ ] Install Sentry SDK: `npm install @sentry/nextjs`
- [ ] Run: `npx @sentry/wizard@latest -i nextjs`

**Cost:** Free up to 5k errors/month

### 4. SMS Service (Optional - Twilio)
- [ ] Sign up at https://twilio.com
- [ ] Buy Indian phone number
- [ ] Get Account SID & Auth Token
- [ ] Verify test numbers

**Cost:** ₹0.50-1.50 per SMS

### 5. Database
- [ ] Set up production database (PostgreSQL/MongoDB)
- [ ] Enable SSL connections
- [ ] Set up automated backups
- [ ] Configure connection pooling

### 6. Hosting (Vercel Recommended)
- [ ] Sign up at https://vercel.com
- [ ] Connect GitHub repository
- [ ] Add environment variables
- [ ] Configure custom domain
- [ ] Enable automatic deployments

**Cost:** Free for hobby, $20/month for Pro

## Installation Steps

### Step 1: Install Dependencies
```bash
npm install @sentry/nextjs
npm install @sendgrid/mail
# OR
npm install @aws-sdk/client-ses
```

### Step 2: Configure Environment Variables
```bash
cp .env.production.example .env.production
# Edit .env.production with your actual keys
```

### Step 3: Set up Sentry
```bash
npx @sentry/wizard@latest -i nextjs
```

### Step 4: Create API Routes

#### `/api/payment/create-order` (Razorpay)
```typescript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const { amount } = await req.json();
  
  const order = await razorpay.orders.create({
    amount: amount, // in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  });
  
  return Response.json({ orderId: order.id });
}
```

#### `/api/payment/verify` (Razorpay)
```typescript
import crypto from 'crypto';

export async function POST(req: Request) {
  const { orderId, paymentId, signature } = await req.json();
  
  const text = `${orderId}|${paymentId}`;
  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest('hex');
  
  if (generated === signature) {
    // Payment verified - update booking status
    return Response.json({ verified: true });
  }
  
  return Response.json({ verified: false }, { status: 400 });
}
```

#### `/api/email/booking-confirmation` (SendGrid)
```typescript
import sgMail from '@sendgrid/mail';
import { getBookingConfirmationTemplate } from '@/lib/email-service';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  const data = await req.json();
  
  const msg = {
    to: data.customerEmail,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Booking Confirmation - SalonHub',
    html: getBookingConfirmationTemplate(data),
  };
  
  await sgMail.send(msg);
  return Response.json({ success: true });
}
```

### Step 5: Update Booking Page

Add to `src/app/book/[id]/page.tsx`:
```typescript
import { initiateRazorpayPayment } from '@/lib/razorpay';
import { sendBookingConfirmationEmail } from '@/lib/email-service';
import { logError, logEvent } from '@/lib/sentry';

// In handleBooking function, after successful booking:
if (paymentMethod === "online" || paymentMethod === "netbanking") {
  await initiateRazorpayPayment(
    totalPrice,
    {
      salonName: salon.name,
      customerName: session.user.name,
      customerEmail: session.user.email,
      customerPhone: session.user.phone || '',
    },
    async (paymentId, orderId, signature) => {
      // Verify payment
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        body: JSON.stringify({ orderId, paymentId, signature }),
      });
      
      if (verifyRes.ok) {
        // Send confirmation email
        await sendBookingConfirmationEmail({
          customerName: session.user.name,
          customerEmail: session.user.email,
          salonName: salon.name,
          salonAddress: salon.address,
          serviceName: selectedServicesList.map(s => s.name).join(', '),
          bookingDate: selectedDate.toLocaleDateString(),
          bookingTime: selectedSlot.startTime,
          totalAmount: totalPrice,
          bookingId: 'BOOK-' + Date.now(),
        });
        
        logEvent('booking_completed', { salonId, amount: totalPrice });
        setBookingSuccess(true);
      }
    },
    (error) => {
      logError(error, { context: 'payment_failed' });
      toast.error('Payment failed. Please try again.');
    }
  );
}
```

### Step 6: Initialize Sentry

Add to `src/app/layout.tsx`:
```typescript
import { initSentry } from '@/lib/sentry';

// At the top of the file
if (typeof window !== 'undefined') {
  initSentry();
}
```

## Testing Checklist

### Payment Testing
- [ ] Test with Razorpay test cards
- [ ] Test payment success flow
- [ ] Test payment failure flow
- [ ] Test webhook handling
- [ ] Verify payment in Razorpay dashboard

### Email Testing
- [ ] Send test booking confirmation
- [ ] Check spam folder
- [ ] Verify email formatting on mobile
- [ ] Test with different email providers

### Error Tracking
- [ ] Trigger test error
- [ ] Verify error appears in Sentry
- [ ] Check error grouping
- [ ] Test source maps

### Load Testing
- [ ] Test with 100 concurrent users
- [ ] Monitor response times
- [ ] Check database connections
- [ ] Verify rate limiting

## Security Checklist
- [ ] Enable HTTPS only
- [ ] Set secure headers (CSP, HSTS)
- [ ] Implement rate limiting
- [ ] Sanitize user inputs
- [ ] Use environment variables for secrets
- [ ] Enable CORS properly
- [ ] Implement CSRF protection
- [ ] Regular security audits

## Monitoring Setup
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure performance monitoring
- [ ] Set up error alerts
- [ ] Monitor payment success rate
- [ ] Track booking conversion rate

## Launch Checklist
- [ ] All tests passing
- [ ] Payment gateway in live mode
- [ ] Email service verified
- [ ] Error tracking active
- [ ] Backups configured
- [ ] SSL certificate installed
- [ ] Custom domain configured
- [ ] Terms & Privacy pages live
- [ ] Contact information updated
- [ ] Support email set up

## Post-Launch
- [ ] Monitor errors in Sentry
- [ ] Check payment success rate
- [ ] Review email delivery rate
- [ ] Monitor server performance
- [ ] Collect user feedback
- [ ] Plan feature updates

## Support Contacts
- Razorpay Support: support@razorpay.com
- SendGrid Support: https://support.sendgrid.com
- Sentry Support: https://sentry.io/support
- Vercel Support: https://vercel.com/support

## Estimated Monthly Costs
- Hosting (Vercel Pro): $20
- Razorpay: 2% per transaction
- SendGrid: $15 (40k emails)
- Sentry: Free (5k errors)
- SMS (Optional): Variable
- **Total Base Cost: ~$35/month + transaction fees**
