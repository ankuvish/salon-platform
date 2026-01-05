# Deploy to Netlify - Complete Guide

## Prerequisites
- GitHub account
- Netlify account (free tier works)
- Your code pushed to GitHub

## Step 1: Push Code to GitHub (5 min)

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/salon-platform.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Netlify (10 min)

### A. Connect Repository
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Select your `salon-platform` repository
5. Click "Deploy"

### B. Configure Build Settings
Netlify will auto-detect Next.js. Verify:
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** 20

### C. Add Environment Variables
Go to Site settings → Environment variables → Add:

```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app

# Add these later when ready:
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key
SENDGRID_API_KEY=your_key
NEXT_PUBLIC_SENTRY_DSN=your_dsn
```

## Step 3: Install Netlify Plugin

Add to `package.json`:
```bash
npm install --save-dev @netlify/plugin-nextjs
```

Commit and push:
```bash
git add package.json package-lock.json
git commit -m "Add Netlify plugin"
git push
```

## Step 4: Configure Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., mysalon.com)
4. Update DNS records at your domain provider:
   - Add CNAME record pointing to your-site.netlify.app

## Step 5: Enable HTTPS

1. Go to Site settings → Domain management → HTTPS
2. Click "Verify DNS configuration"
3. Click "Provision certificate" (automatic & free)

## Common Issues & Fixes

### Build Fails
```bash
# Clear cache and rebuild
# In Netlify: Deploys → Trigger deploy → Clear cache and deploy site
```

### Environment Variables Not Working
- Make sure they start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding variables

### 404 Errors
- Check `netlify.toml` exists
- Verify redirects are configured

### API Calls Failing
- Update `NEXT_PUBLIC_API_URL` to your backend URL
- Enable CORS on backend for Netlify domain

## Deployment Checklist

Before going live:
- [ ] All environment variables added
- [ ] Build succeeds locally: `npm run build`
- [ ] Test site on Netlify preview URL
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS enabled
- [ ] Backend API accessible
- [ ] Payment gateway in test mode
- [ ] Error tracking configured

## Post-Deployment

### Monitor Your Site
1. **Netlify Analytics** (Site settings → Analytics)
2. **Sentry** for errors
3. **Google Analytics** (add tracking ID)

### Continuous Deployment
Every push to `main` branch auto-deploys:
```bash
git add .
git commit -m "Update feature"
git push
# Netlify automatically rebuilds and deploys
```

### Rollback if Needed
1. Go to Deploys
2. Find previous working deploy
3. Click "Publish deploy"

## Free Tier Limits
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- Automatic HTTPS
- Continuous deployment

## Upgrade When Needed
- Pro: $19/month (more bandwidth, faster builds)
- Business: $99/month (team features, SSO)

## Alternative: Vercel
If Netlify doesn't work:
1. Go to https://vercel.com
2. Import GitHub repository
3. Deploy (even easier than Netlify)

## Support
- Netlify Docs: https://docs.netlify.com
- Community: https://answers.netlify.com
- Status: https://www.netlifystatus.com

## Quick Commands

```bash
# Test build locally
npm run build
npm start

# Check for errors
npm run lint

# Deploy preview (if Netlify CLI installed)
netlify deploy

# Deploy to production
netlify deploy --prod
```

## Your Site URLs
- **Preview:** https://your-site.netlify.app
- **Custom:** https://yourdomain.com (after setup)
- **Admin:** https://app.netlify.com/sites/your-site

## Next Steps After Deployment
1. Test all features on live site
2. Set up payment gateway (live mode)
3. Configure email service
4. Add Google Analytics
5. Submit to Google Search Console
6. Share with users! 🚀

---

**Estimated Time:** 15-20 minutes for first deployment
**Cost:** FREE (Netlify free tier)
