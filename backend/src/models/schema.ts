import { pgTable, serial, varchar, text, timestamp, integer, boolean, decimal, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['buyer', 'seller', 'service_provider', 'researcher']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']);
export const bookingStatusEnum = pgEnum('booking_status', ['queued', 'in_progress', 'completed', 'pickup', 'delivery']);
export const componentTypeEnum = pgEnum('component_type', ['electrical', 'mechanical', 'materials', 'consumables']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  googleId: varchar('google_id', { length: 255 }),
  role: userRoleEnum('role').notNull().default('buyer'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Profiles table
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  company: varchar('company', { length: 255 }),
  bio: text('bio'),
  location: varchar('location', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  avatar: varchar('avatar', { length: 500 }),
  portfolio: text('portfolio'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Components table
export const components = pgTable('components', {
  id: serial('id').primaryKey(),
  sellerId: integer('seller_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: componentTypeEnum('type').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  availability: integer('availability').default(0),
  images: text('images'), // JSON array of image URLs
  technicalDetails: text('technical_details'), // JSON
  datasheetUrl: varchar('datasheet_url', { length: 500 }),
  compatibilities: text('compatibilities'), // JSON array
  location: varchar('location', { length: 255 }),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  buyerId: integer('buyer_id').notNull().references(() => users.id),
  sellerId: integer('seller_id').notNull().references(() => users.id),
  componentId: integer('component_id').notNull().references(() => components.id),
  quantity: integer('quantity').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Services table
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }), // 3D printing, CNC machining, PCB assembly, etc.
  equipmentSpecs: text('equipment_specs'), // JSON
  pricingModel: varchar('pricing_model', { length: 50 }), // hourly, project, per_unit
  pricePerUnit: decimal('price_per_unit', { precision: 10, scale: 2 }),
  leadTime: integer('lead_time'), // in days
  images: text('images'), // JSON array
  location: varchar('location', { length: 255 }),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').notNull().references(() => services.id),
  userId: integer('user_id').notNull().references(() => users.id),
  providerId: integer('provider_id').notNull().references(() => users.id),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  status: bookingStatusEnum('status').notNull().default('queued'),
  projectSpecs: text('project_specs'),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Community Posts table
export const communityPosts = pgTable('community_posts', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }), // fabrication_request, innovation, challenge, partnership
  tags: text('tags'), // JSON array
  images: text('images'), // JSON array
  status: varchar('status', { length: 50 }).default('open'), // open, in_progress, closed
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Post Replies table
export const postReplies = pgTable('post_replies', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => communityPosts.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull().references(() => users.id),
  receiverId: integer('receiver_id').notNull().references(() => users.id),
  subject: varchar('subject', { length: 255 }),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  reviewerId: integer('reviewer_id').notNull().references(() => users.id),
  targetType: varchar('target_type', { length: 50 }).notNull(), // component, service, user
  targetId: integer('target_id').notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Wishlists table
export const wishlists = pgTable('wishlists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  componentId: integer('component_id').references(() => components.id),
  serviceId: integer('service_id').references(() => services.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(), // order, booking, message, reply, review
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  relatedType: varchar('related_type', { length: 50 }), // component, service, order, booking, post
  relatedId: integer('related_id'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Quotes table
export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').notNull().references(() => services.id),
  userId: integer('user_id').notNull().references(() => users.id),
  providerId: integer('provider_id').notNull().references(() => users.id),
  projectDescription: text('project_description').notNull(),
  specifications: text('specifications'), // JSON
  estimatedPrice: decimal('estimated_price', { precision: 10, scale: 2 }),
  estimatedDuration: integer('estimated_duration'), // in days
  status: varchar('status', { length: 50 }).default('pending'), // pending, approved, rejected, expired
  notes: text('notes'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
