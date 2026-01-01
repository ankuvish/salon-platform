# Quick Production Setup (30 Minutes)

## Immediate Actions Required

### 1. Install Required Packages (2 min)
```bash
npm install razorpay @sendgrid/mail @sentry/nextjs
```

### 2. Sign Up for Services (15 min)

**Razorpay (Payment):**
1. Go to https://razorpay.com/signup
2. Complete basic registration
3. Get Test API Keys from Dashboard → Settings → API Keys
4. Note: Live keys require KYC (takes 2-3 days)

**SendGrid (Email):**
1. Go to https://signup.sendgrid.com
2. Verify your email
3. Create API Key: Settings → API Keys → Create API Key
4. Verify sender email: Settings → Sender Authentication

**Sentry (Error Tracking):**
1. Go to https://sentry.io/signup
2. Create new Next.js project
3. Copy DSN from project settings

### 3. Configure Environment Variables (5 min)
Create `.env.local`:
```bash
# Razorpay (Test Mode)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret

# SendGrid
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=your_verified_email@domain.com

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://your_dsn@sentry.io/project

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Initialize Sentry (3 min)
```bash
npx @sentry/wizard@latest -i nextjs
```
Follow the prompts and select default options.

### 5. Test Everything (5 min)
```bash
# Start dev server
npm run dev

# In another terminal, test APIs
npm run test:api

# Test booking flow manually:
# 1. Go to http://localhost:3000
# 2. Select a salon
# 3. Complete booking with test payment
```

## Test Payment Cards (Razorpay)
```
Success: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date

Failure: 4000 0000 0000 0002
```

## Verify Setup Checklist
- [ ] Razorpay test payment works
- [ ] Booking confirmation email received
- [ ] Error appears in Sentry dashboard
- [ ] Terms checkbox appears on booking page
- [ ] Build completes without errors: `npm run build`

## Go Live Checklist (After Testing)
1. **Razorpay:** Complete KYC → Switch to live keys
2. **SendGrid:** Verify domain (not just email) for better deliverability
3. **Sentry:** Review error alerts settings
4. **Deploy:** Push to Vercel/hosting
5. **Monitor:** Check Sentry for first 24 hours

## Common Issues

**Payment not working?**
- Check Razorpay keys are correct
- Verify test mode is enabled
- Check browser console for errors

**Email not sending?**
- Verify sender email in SendGrid
- Check spam folder
- Review SendGrid activity logs

**Sentry not tracking?**
- Verify DSN is correct
- Check if source maps are uploaded
- Trigger test error: throw new Error('test')

## Support
- Razorpay Docs: https://razorpay.com/docs
- SendGrid Docs: https://docs.sendgrid.com
- Sentry Docs: https://docs.sentry.io

## Next Steps
Once everything works in test mode:
1. Complete Razorpay KYC (2-3 business days)
2. Switch to live API keys
3. Deploy to production
4. Monitor for 48 hours
5. Announce launch! 🚀
