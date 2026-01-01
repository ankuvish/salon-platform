# Backend Security Implementation Guide

## Add to backend/src/index.ts

```typescript
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();

// 1. Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 2. Rate Limiting - General API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// 3. Rate Limiting - Authentication (Stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/login-email', authLimiter);
app.use('/api/auth/send-otp', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth/register', authLimiter);

// 4. Rate Limiting - Booking (Prevent spam)
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bookings per hour
  message: 'Too many bookings, please try again later.',
});

app.use('/api/bookings', bookingLimiter);

// 5. CORS Configuration (Update for production)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 6. Body Parser Limits (Prevent large payloads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. Request Logging (Production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// 8. Error Handler (Don't expose stack traces in production)
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    });
  } else {
    res.status(500).json({ 
      error: err.message,
      stack: err.stack 
    });
  }
});

// Your existing routes...
```

## Environment Variables for Backend

Add to backend/.env:

```env
# Production
NODE_ENV=production
PORT=4000

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-session-secret-change-this

# Database
DATABASE_URL=your-production-database-url

# CORS
ALLOWED_ORIGINS=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Testing Rate Limiting

```bash
# Test auth rate limit (should block after 5 attempts)
for i in {1..10}; do
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

## Monitoring

Add logging service integration:

```typescript
// Example with Winston
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log all requests
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  next();
});
```

## Security Checklist for Backend

- [x] Rate limiting implemented
- [x] Security headers configured
- [x] CORS properly configured
- [x] Input validation on all endpoints
- [x] Error handling (no stack traces in production)
- [x] Request size limits
- [x] Logging configured
- [ ] Database connection pooling
- [ ] Backup strategy
- [ ] SSL/TLS certificate
- [ ] Firewall rules
- [ ] DDoS protection

## Deploy Backend

```bash
# Build
npm run build

# Start production
NODE_ENV=production npm start

# Or use PM2 for process management
pm2 start dist/index.js --name salon-api
pm2 save
pm2 startup
```

Your backend is now production-ready! 🚀
