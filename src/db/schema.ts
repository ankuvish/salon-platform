import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default("customer"), // Added: customer/owner
  phone: text("phone"), // Added: for OTP authentication
  gender: text("gender"), // Added: male/female/other
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Salons table - Updated to add zipCode field
export const salons = sqliteTable('salons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ownerId: text('owner_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  zipCode: text('zip_code'), // Added: postal/zip code field
  latitude: real('latitude'),
  longitude: real('longitude'),
  phone: text('phone').notNull(),
  rating: real('rating').notNull().default(0),
  imageUrl: text('image_url'),
  openingTime: text('opening_time').notNull(),
  closingTime: text('closing_time').notNull(),
  salonType: text('salon_type').notNull().default('unisex'), // Added: men/women/unisex
  gstNumber: text('gst_number'), // Added: for verification
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false), // Added
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false), // Added: for featured salons
  verificationDocuments: text('verification_documents', { mode: 'json' }), // Added: JSON field
  createdAt: text('created_at').notNull(),
});

// Services table - unchanged
export const services = sqliteTable('services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  salonId: integer('salon_id').notNull().references(() => salons.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  price: real('price').notNull(),
  createdAt: text('created_at').notNull(),
});

// Staff table - unchanged
export const staff = sqliteTable('staff', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  salonId: integer('salon_id').notNull().references(() => salons.id),
  name: text('name').notNull(),
  specialization: text('specialization').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull(),
});

// Bookings table - Updated to add payment fields
export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customerId: text('customer_id').notNull().references(() => user.id),
  salonId: integer('salon_id').notNull().references(() => salons.id),
  serviceId: integer('service_id').notNull().references(() => services.id),
  staffId: integer('staff_id').notNull().references(() => staff.id),
  bookingDate: text('booking_date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  status: text('status').notNull(),
  notes: text('notes'),
  paymentMethod: text('payment_method'), // Added: cash/online/netbanking
  paymentStatus: text('payment_status'), // Added: pending/processing/completed/failed
  paymentTransactionId: text('payment_transaction_id'), // Added: transaction reference
  createdAt: text('created_at').notNull(),
});

// Reviews table - Updated to reference user.id (text)
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  salonId: integer('salon_id').notNull().references(() => salons.id),
  customerId: text('customer_id').notNull().references(() => user.id), // Changed from integer to text
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: text('created_at').notNull(),
});

// Promotions table - unchanged
export const promotions = sqliteTable('promotions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  salonId: integer('salon_id').notNull().references(() => salons.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  discountPercentage: integer('discount_percentage').notNull(),
  validFrom: text('valid_from').notNull(),
  validUntil: text('valid_until').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});