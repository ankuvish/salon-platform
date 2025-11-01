import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { auth } from './lib/auth';

// Import routes
import salonsRouter from './routes/salons';
import servicesRouter from './routes/services';
import staffRouter from './routes/staff';
import bookingsRouter from './routes/bookings';
import availabilityRouter from './routes/availability';
import reviewsRouter from './routes/reviews';
import promotionsRouter from './routes/promotions';
import usersRouter from './routes/users';
import notificationsRouter from './routes/notifications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SalonBook Backend API is running' });
});

// Better-auth routes
app.all('/api/auth/*', async (req, res) => {
  return auth.handler(req as any, res as any);
});

// API routes
app.use('/api/salons', salonsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/staff', staffRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SalonBook Backend API running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔐 Better-auth endpoint: http://localhost:${PORT}/api/auth`);
});

export default app;
