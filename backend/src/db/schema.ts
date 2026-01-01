import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  roles: string[];
  phone?: string;
  gender?: string;
  username?: string;
  emailVerified: boolean;
  image?: string;
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISalon extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  address: string;
  city: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  rating: number;
  imageUrl?: string;
  openingTime: string;
  closingTime: string;
  salonType: string;
  gstNumber?: string;
  isVerified: boolean;
  verificationDocuments?: any;
  numberOfSeats?: number;
  approvalStatus?: string;
  rejectionReason?: string;
  createdAt: Date;
}

export interface IService extends Document {
  salonId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  createdAt: Date;
}

export interface IStaff extends Document {
  salonId: mongoose.Types.ObjectId;
  name: string;
  specialization: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface IBooking extends Document {
  customerId: mongoose.Types.ObjectId;
  salonId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentTransactionId?: string;
  viewedByOwner?: boolean;
  createdAt: Date;
}

export interface IReview extends Document {
  salonId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface IPromotion extends Document {
  salonId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  discountPercentage: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: Date;
}

export interface IFollow extends Document {
  followerId: mongoose.Types.ObjectId;
  followingId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  relatedUserId?: mongoose.Types.ObjectId;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  messageType: 'text' | 'image' | 'salon';
  content: string;
  imageUrl?: string;
  salonId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  roles: { type: [String], default: ['customer'] },
  phone: String,
  gender: String,
  username: { type: String, unique: true, sparse: true },
  emailVerified: { type: Boolean, default: false },
  image: String,
  region: String,
}, { timestamps: true });

const salonSchema = new Schema<ISalon>({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  name: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: String,
  latitude: Number,
  longitude: Number,
  phone: { type: String, required: true },
  rating: { type: Number, default: 0 },
  imageUrl: String,
  openingTime: { type: String, required: true },
  closingTime: { type: String, required: true },
  salonType: { type: String, default: 'unisex' },
  gstNumber: String,
  isVerified: { type: Boolean, default: false },
  verificationDocuments: Schema.Types.Mixed,
  numberOfSeats: { type: Number, default: 1 },
  approvalStatus: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  rejectionReason: String,
  createdAt: { type: Date, default: Date.now },
});

const serviceSchema = new Schema<IService>({
  salonId: { type: Schema.Types.ObjectId, ref: 'Salon', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const staffSchema = new Schema<IStaff>({
  salonId: { type: Schema.Types.ObjectId, ref: 'Salon', required: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const bookingSchema = new Schema<IBooking>({
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  salonId: { type: Schema.Types.ObjectId, ref: 'Salon', required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  bookingDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, required: true, default: 'pending' },
  notes: { type: String, required: false },
  paymentMethod: { type: String, required: false },
  paymentStatus: { type: String, required: false },
  paymentTransactionId: { type: String, required: false },
  viewedByOwner: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { strict: false });

bookingSchema.index({ salonId: 1, bookingDate: 1, status: 1 });
bookingSchema.index({ customerId: 1, status: 1 });

const reviewSchema = new Schema<IReview>({
  salonId: { type: Schema.Types.ObjectId, ref: 'Salon', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: false },
  rating: { type: Number, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

const promotionSchema = new Schema<IPromotion>({
  salonId: { type: Schema.Types.ObjectId, ref: 'Salon', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  discountPercentage: { type: Number, required: true },
  validFrom: { type: String, required: true },
  validUntil: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const followSchema = new Schema<IFollow>({
  followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  relatedId: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const messageSchema = new Schema<IMessage>({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messageType: { type: String, enum: ['text', 'image', 'salon'], required: true },
  content: { type: String, required: true },
  imageUrl: String,
  salonId: { type: Schema.Types.ObjectId, ref: 'Salon' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
export const Salon = mongoose.model<ISalon>('Salon', salonSchema);
export const Service = mongoose.model<IService>('Service', serviceSchema);
export const Staff = mongoose.model<IStaff>('Staff', staffSchema);
export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
export const Review = mongoose.model<IReview>('Review', reviewSchema);
export const Promotion = mongoose.model<IPromotion>('Promotion', promotionSchema);
export const Follow = mongoose.model<IFollow>('Follow', followSchema);
export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export const Message = mongoose.model<IMessage>('Message', messageSchema);
