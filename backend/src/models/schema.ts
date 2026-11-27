import { pgTable, serial, varchar, text, timestamp, integer, boolean, decimal, pgEnum } from 'drizzle-orm/pg-core';

// SharedDB Canonical Schema for the DFN Ecosystem:
// digital-fabrication-network manages migrations and connection pools for SharedDB,
// while dfn-digisec (Identity/KYC) and dfn-finworld (Escrow/Billing/Quotas) read
// and write their domain tables on this SharedDB by default (or dedicated DBs via overrides).

// Enums
export const userRoleEnum = pgEnum('user_role', ['explorer', 'provider', 'admin', 'platform_manager']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'successful', 'failed', 'escrowed', 'released', 'refunded']);
export const planTierEnum = pgEnum('plan_tier', ['free', 'team', 'business', 'enterprise']);
export const supplierTypeEnum = pgEnum('supplier_type', ['local', 'african', 'international']);
export const supplierVerificationEnum = pgEnum('supplier_verification', ['unverified', 'pending', 'verified', 'premium']);

// Organizations table (aligned with dfn-digisec)
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  orgKey: varchar('org_key', { length: 120 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  ownerUserId: integer('owner_user_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  googleId: varchar('google_id', { length: 255 }),
  orgId: varchar('org_id', { length: 120 }),
  orgRole: varchar('org_role', { length: 40 }).default('owner'),
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

// Escrow milestones table for multi-milestone contract partitioning
export const escrowMilestones = pgTable('escrow_milestones', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id').references(() => transactions.id),
  rfqId: integer('rfq_id').notNull(),
  tenantId: integer('tenant_id').notNull(),
  milestoneIndex: integer('milestone_index').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('NGN'),
  status: varchar('status', { length: 50 }).notNull().default('locked'),
  workAuthorizationTicket: varchar('work_authorization_ticket', { length: 255 }),
  releasedAt: timestamp('released_at'),
  refundedAt: timestamp('refunded_at'),
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

// Waitlist submissions table
export const waitlist = pgTable('waitlist', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('explorer'),
  organization: varchar('organization', { length: 255 }),
  notes: text('notes'),
  queueNumber: integer('queue_number'),
  createdAt: timestamp('created_at').defaultNow(),
});

// First-Article Quality Control Inspections table
export const qcInspections = pgTable('qc_inspections', {
  id: serial('id').primaryKey(),
  batchId: varchar('batch_id', { length: 100 }).notNull(),
  partNumber: varchar('part_number', { length: 100 }).notNull(),
  operatorId: integer('operator_id').references(() => users.id),
  operatorName: varchar('operator_name', { length: 255 }),
  nominalMm: decimal('nominal_mm', { precision: 10, scale: 4 }).notNull(),
  toleranceUpperMm: decimal('tolerance_upper_mm', { precision: 10, scale: 4 }).notNull(),
  toleranceLowerMm: decimal('tolerance_lower_mm', { precision: 10, scale: 4 }).notNull(),
  maxTaperMm: decimal('max_taper_mm', { precision: 10, scale: 4 }).default('0.0030'),
  readings: text('readings').notNull(), // JSON array string e.g. [40.008, 40.007, 40.009]
  taperDeviationMm: decimal('taper_deviation_mm', { precision: 10, scale: 4 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(), // 'ACCEPTED' | 'REJECTED'
  failureReason: text('failure_reason'),
  photoUrl: varchar('photo_url', { length: 500 }),
  notes: text('notes'),
  metadata: text('metadata'), // JSON object string (device, offline sync, timestamp)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Workshop subaccounts (dfn-finworld domain table in SharedDB)
export const workshopSubaccounts = pgTable('workshop_subaccounts', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  gateway: varchar('gateway', { length: 50 }).notNull().default('flutterwave'),
  subaccountCode: varchar('subaccount_code', { length: 120 }).notNull().unique(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  settlementBank: varchar('settlement_bank', { length: 50 }).notNull(),
  accountNumber: varchar('account_number', { length: 20 }).notNull(),
  percentageCharge: decimal('percentage_charge', { precision: 5, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Organization SaaS subscriptions & quotas (dfn-finworld domain table in SharedDB)
export const orgSubscriptions = pgTable('org_subscriptions', {
  id: serial('id').primaryKey(),
  orgId: varchar('org_id', { length: 120 }).notNull().unique(),
  plan: planTierEnum('plan').notNull().default('free'),
  status: varchar('status', { length: 40 }).notNull().default('active'),
  jobsRemaining: integer('jobs_remaining').notNull().default(10),
  batchSizeLimit: integer('batch_size_limit').notNull().default(2),
  apiCallsRemaining: integer('api_calls_remaining').notNull().default(100),
  features: text('features').notNull().default('[]'),
  paymentProvider: varchar('payment_provider', { length: 50 }).notNull().default('flutterwave'),
  lastTransactionRef: varchar('last_transaction_ref', { length: 120 }),
  periodStartsAt: timestamp('period_starts_at').defaultNow(),
  periodEndsAt: timestamp('period_ends_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Usage metering ledger (dfn-finworld domain table in SharedDB)
export const usageEvents = pgTable('usage_events', {
  id: serial('id').primaryKey(),
  orgId: varchar('org_id', { length: 120 }).notNull(),
  userId: varchar('user_id', { length: 120 }).notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  units: integer('units').notNull().default(1),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Institutional FIRS invoices (dfn-finworld domain table in SharedDB)
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 80 }).notNull().unique(),
  rfqId: integer('rfq_id'),
  orgId: varchar('org_id', { length: 120 }).notNull(),
  cacNumber: varchar('cac_number', { length: 64 }),
  tinNumber: varchar('tin_number', { length: 64 }),
  subtotalAmount: decimal('subtotal_amount', { precision: 12, scale: 2 }).notNull(),
  vatAmount: decimal('vat_amount', { precision: 12, scale: 2 }).notNull(),
  whtAmount: decimal('wht_amount', { precision: 12, scale: 2 }).notNull(),
  netPayableAmount: decimal('net_payable_amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('NGN'),
  itemsJson: text('items_json'),
  paid: boolean('paid').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Escrow technical holds & idempotency keys (dfn-finworld domain tables in SharedDB)
export const escrowHolds = pgTable('escrow_holds', {
  id: serial('id').primaryKey(),
  holdCode: varchar('hold_code', { length: 120 }).notNull().unique(),
  rfqId: integer('rfq_id').notNull(),
  tenantId: integer('tenant_id').notNull(),
  milestoneIndex: integer('milestone_index'),
  holdType: varchar('hold_type', { length: 64 }).notNull(),
  reason: text('reason').notNull(),
  referenceId: varchar('reference_id', { length: 120 }),
  affectedSerialNumbers: text('affected_serial_numbers'),
  active: boolean('active').notNull().default(true),
  appliedAt: timestamp('applied_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: integer('resolved_by'),
  resolutionAction: varchar('resolution_action', { length: 80 }),
  notes: text('notes'),
});

export const escrowIdempotency = pgTable('escrow_idempotency', {
  id: serial('id').primaryKey(),
  idempotencyKey: varchar('idempotency_key', { length: 160 }).notNull().unique(),
  operation: varchar('operation', { length: 64 }).notNull(),
  responseJson: text('response_json').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Blog & field notes CMS table
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  excerpt: text('excerpt'),
  content: text('content'),
  htmlContent: text('html_content').notNull(),
  coverImageUrl: varchar('cover_image_url', { length: 500 }),
  category: varchar('category', { length: 100 }).default('Engineering'),
  badge: varchar('badge', { length: 80 }),
  status: varchar('status', { length: 40 }).notNull().default('draft'), // draft | published | archived
  authorId: integer('author_id').references(() => users.id),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Product-line queue dispatcher table
export const queueJobs = pgTable('queue_jobs', {
  id: serial('id').primaryKey(),
  jobId: varchar('job_id', { length: 120 }).notNull().unique(),
  queueName: varchar('queue_name', { length: 80 }).notNull(),
  jobType: varchar('job_type', { length: 120 }).notNull(),
  targetService: varchar('target_service', { length: 64 }).notNull(),
  orgId: varchar('org_id', { length: 120 }),
  payload: text('payload').notNull(),
  status: varchar('status', { length: 40 }).notNull().default('queued'), // queued | processing | completed | failed | dead_letter
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  dispatchedToUrl: varchar('dispatched_to_url', { length: 255 }),
  resultJson: text('result_json'),
  lastError: text('last_error'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// NOTE: Domain service boundaries:
// - Identity, authentication & Nigerian KYC tables are governed by dfn-digisec in SharedDB.
// - Escrow, billing, subscriptions & invoicing tables are governed by dfn-finworld in SharedDB.
// - Platform catalog, waitlist, blog CMS, QC inspections & queueing live in digital-fabrication-network.

