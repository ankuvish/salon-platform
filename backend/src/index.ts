import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { connectDB } from './db';

dotenv.config();

import authRouter from './routes/auth';
import salonsRouter from './routes/salons';
import servicesRouter from './routes/services';
import staffRouter from './routes/staff';
import bookingsRouter from './routes/bookings';
import availabilityRouter from './routes/availability';
import reviewsRouter from './routes/reviews';
import promotionsRouter from './routes/promotions';
import usersRouter from './routes/users';
import notificationsRouter from './routes/notifications';
import followsRouter from './routes/follows';
import messagesRouter from './routes/messages';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SalonBook Backend API',
    database: 'MongoDB',
    endpoints: {
      health: '/health',
      salons: '/api/salons',
      services: '/api/services',
      bookings: '/api/bookings'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SalonBook Backend API is running' });
});

app.get('/.well-known/*', (req, res) => res.status(204).end());

app.use('/api/auth', authRouter);
app.use('/api/salons', salonsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/staff', staffRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/follows', followsRouter);
app.use('/api/messages', messagesRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SalonBook Backend API running on port ${PORT}`);
    console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🗄️  Database: MongoDB`);
  });
});

export default app;
