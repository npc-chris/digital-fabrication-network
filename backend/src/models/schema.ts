import { pgTable, serial, varchar, text, timestamp, integer, boolean, decimal, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['explorer', 'provider', 'admin', 'platform_manager']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'successful', 'failed', 'escrowed', 'released', 'refunded']);
export const supplierTypeEnum = pgEnum('supplier_type', ['local', 'african', 'international']);
export const supplierVerificationEnum = pgEnum('supplier_verification', ['unverified', 'pending', 'verified', 'premium']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  googleId: varchar('google_id', { length: 255 }),
  role: userRoleEnum('role').notNull().default('explorer'),
  isVerified: boolean('is_verified').default(false),
  onboardingCompleted: boolean('onboarding_completed').default(false),
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
  // Supplier verification fields
  supplierType: supplierTypeEnum('supplier_type').default('local'),
  verificationStatus: supplierVerificationEnum('verification_status').default('unverified'),
  verifiedAt: timestamp('verified_at'),
  // Mentorship fields
  isMentor: boolean('is_mentor').default(false),
  mentorshipAreas: text('mentorship_areas'), // JSON array
  mentorBio: text('mentor_bio'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Transactions table to track payments
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  paymentProvider: varchar('payment_provider', { length: 50 }).notNull(), // 'paystack' or 'flutterwave'
  reference: varchar('reference', { length: 100 }).notNull().unique(), // External provider reference
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('NGN'),
  status: paymentStatusEnum('status').notNull().default('pending'),
  metadata: text('metadata'), // JSON string
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

// Machine Capabilities - specific technical specs for provider machines
export const machineCapabilities = pgTable('machine_capabilities', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull().references(() => users.id),
  serviceId: integer('service_id').references(() => services.id), // Link to a specific service if applicable
  machineType: varchar('machine_type', { length: 100 }).notNull(), // e.g., 'FDM 3D Printer', 'CNC Router', 'Pick and Place'
  minWallThickness: decimal('min_wall_thickness', { precision: 10, scale: 3 }), // in mm
  maxVolume: varchar('max_volume', { length: 100 }), // e.g., '300x300x400 mm'
  precision: decimal('precision', { precision: 10, scale: 4 }), // in mm
  materialsSupported: text('materials_supported'), // JSON array
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  
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

// Supplier verification documents
export const verificationDocuments = pgTable('verification_documents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  documentType: varchar('document_type', { length: 50 }).notNull(), // business_license, tax_id, address_proof, etc.
  documentUrl: varchar('document_url', { length: 500 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'), // pending, approved, rejected
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewNotes: text('review_notes'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Structured onboarding payload snapshots
export const onboardingSubmissions = pgTable('onboarding_submissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id),
  role: userRoleEnum('role').notNull(),
  currentStep: integer('current_step').default(1),
  identityFork: text('identity_fork'), // JSON
  domainCalibration: text('domain_calibration'), // JSON
  workflowSync: text('workflow_sync'), // JSON
  providerCapabilities: text('provider_capabilities'), // JSON
  providerVerification: text('provider_verification'), // JSON
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Email verification codes table
export const emailVerificationCodes = pgTable('email_verification_codes', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// NOTE: tables intentionally removed from this runtime schema:
// affiliate_stores, blog_*, bookings, build_pipelines, cart_items, carts,
// community_posts, component_*, components, forum_*, group_buying_*,
// mentorship_*, messages, order_tracking, orders, pipeline_executions,
// project_*, quotes, reviews, wishlists.
