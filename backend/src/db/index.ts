import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salonbook';

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('📍 Connection:', MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Using fallback mode - server will run without database');
  }
};

export default mongoose;
