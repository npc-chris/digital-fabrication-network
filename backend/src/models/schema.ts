import { pgTable, serial, varchar, text, timestamp, integer, boolean, decimal, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['explorer', 'provider', 'admin', 'platform_manager']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']);
export const bookingStatusEnum = pgEnum('booking_status', ['queued', 'in_progress', 'completed', 'pickup', 'delivery']);
export const componentTypeEnum = pgEnum('component_type', [
  'electrical', 
  'mechanical', 
  'materials', 
  'consumables',
  'sensors',
  'thermal',
  'chemical',
  'tools'
]);
export const supplierTypeEnum = pgEnum('supplier_type', ['local', 'african', 'international']);
export const supplierVerificationEnum = pgEnum('supplier_verification', ['unverified', 'pending', 'verified', 'premium']);
export const groupBuyingStatusEnum = pgEnum('group_buying_status', ['open', 'funding', 'ordered', 'shipped', 'completed', 'cancelled']);
export const projectVisibilityEnum = pgEnum('project_visibility', ['public', 'unlisted', 'private']);
export const mentorshipStatusEnum = pgEnum('mentorship_status', ['open', 'matched', 'active', 'completed', 'cancelled']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  googleId: varchar('google_id', { length: 255 }),
  role: userRoleEnum('role').notNull().default('explorer'),
  isVerified: boolean('is_verified').default(false),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  providerApproved: boolean('provider_approved').default(false),
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

// Components table
export const components = pgTable('components', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: componentTypeEnum('type').notNull(),
  subcategoryId: varchar('subcategory_id', { length: 100 }).references(() => componentSubcategories.id),
  applicationId: integer('application_id').references(() => componentApplications.id),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  availability: integer('availability').default(0),
  images: text('images'), // JSON array of image URLs
  technicalDetails: text('technical_details'), // JSON
  datasheetUrl: varchar('datasheet_url', { length: 500 }),
  compatibilities: text('compatibilities'), // JSON array
  location: varchar('location', { length: 255 }),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0),
  // Enhanced fields for aggregation
  supplierType: supplierTypeEnum('supplier_type').default('local'),
  isAffiliate: boolean('is_affiliate').default(false),
  affiliateStoreId: integer('affiliate_store_id'), // References affiliateStores.id
  externalUrl: varchar('external_url', { length: 500 }), // Link to external store
  shippingTime: integer('shipping_time'), // Estimated days
  localPriority: integer('local_priority').default(0), // Higher = more local
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  explorerId: integer('explorer_id').notNull().references(() => users.id),
  providerId: integer('provider_id').notNull().references(() => users.id),
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

// ===== NEW STRATEGIC FEATURES TABLES =====

// Affiliate Stores - Partner/Affiliate Integration
export const affiliateStores = pgTable('affiliate_stores', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id), // Store owner
  storeName: varchar('store_name', { length: 255 }).notNull(),
  description: text('description'),
  website: varchar('website', { length: 500 }),
  logo: varchar('logo', { length: 500 }),
  location: varchar('location', { length: 255 }),
  supplierType: supplierTypeEnum('supplier_type').notNull().default('local'),
  // API integration details
  apiEndpoint: varchar('api_endpoint', { length: 500 }),
  apiKey: varchar('api_key', { length: 500 }),
  apiFormat: varchar('api_format', { length: 50 }), // rest, graphql, custom
  endpointMappings: text('endpoint_mappings'), // JSON for endpoint conversion
  // Commission and partnership
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('0'), // Percentage
  isActive: boolean('is_active').default(true),
  isApproved: boolean('is_approved').default(false),
  // Verification
  verificationStatus: supplierVerificationEnum('verification_status').default('pending'),
  verifiedAt: timestamp('verified_at'),
  // Stats
  totalSales: integer('total_sales').default(0),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).default('0'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Projects - Project Hub for sharing builds with BOMs
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }), // robotics, iot, 3d-printing, pcb-design, etc.
  tags: text('tags'), // JSON array
  images: text('images'), // JSON array
  visibility: projectVisibilityEnum('visibility').notNull().default('public'),
  // Project details
  difficulty: varchar('difficulty', { length: 50 }), // beginner, intermediate, advanced
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 2 }),
  estimatedTime: integer('estimated_time'), // in hours
  instructions: text('instructions'), // Markdown or rich text
  toolsRequired: text('tools_required'), // JSON array
  // Collaboration
  isOpenForCollaboration: boolean('is_open_for_collaboration').default(false),
  collaborators: text('collaborators'), // JSON array of user IDs
  // Stats
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  forkCount: integer('fork_count').default(0), // How many times it's been duplicated
  completedCount: integer('completed_count').default(0), // How many people completed it
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Bill of Materials (BOM) for projects
export const projectBoms = pgTable('project_boms', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id),
  componentName: varchar('component_name', { length: 255 }).notNull(),
  componentId: integer('component_id').references(() => components.id), // Link to actual component if available
  quantity: integer('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }),
  supplier: varchar('supplier', { length: 255 }),
  notes: text('notes'),
  alternativeComponents: text('alternative_components'), // JSON array of component IDs
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Cart system with multi-vendor support
export const carts = pgTable('carts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Cart items supporting both internal and affiliate components
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  cartId: integer('cart_id').notNull().references(() => carts.id),
  componentId: integer('component_id').references(() => components.id),
  affiliateStoreId: integer('affiliate_store_id').references(() => affiliateStores.id),
  quantity: integer('quantity').notNull().default(1),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  // For affiliate items
  externalProductId: varchar('external_product_id', { length: 255 }),
  externalProductUrl: varchar('external_product_url', { length: 500 }),
  productName: varchar('product_name', { length: 255 }),
  productImage: varchar('product_image', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Forum threads for technical discussions
export const forumThreads = pgTable('forum_threads', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id').notNull().references(() => users.id),
  categoryId: integer('category_id').references(() => forumCategories.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  tags: text('tags'), // JSON array
  isPinned: boolean('is_pinned').default(false),
  isLocked: boolean('is_locked').default(false),
  viewCount: integer('view_count').default(0),
  replyCount: integer('reply_count').default(0),
  lastReplyAt: timestamp('last_reply_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Forum categories
export const forumCategories = pgTable('forum_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Forum replies
export const forumReplies = pgTable('forum_replies', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id').notNull().references(() => forumThreads.id),
  authorId: integer('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  parentReplyId: integer('parent_reply_id'), // Self-reference to forum_replies.id for nested replies
  likeCount: integer('like_count').default(0),
  isAcceptedAnswer: boolean('is_accepted_answer').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Mentorship system
export const mentorshipRequests = pgTable('mentorship_requests', {
  id: serial('id').primaryKey(),
  menteeId: integer('mentee_id').notNull().references(() => users.id),
  mentorId: integer('mentor_id').references(() => users.id),
  topic: varchar('topic', { length: 255 }).notNull(),
  description: text('description').notNull(),
  goals: text('goals'),
  status: mentorshipStatusEnum('status').notNull().default('open'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Group buying campaigns for international components
export const groupBuyingCampaigns = pgTable('group_buying_campaigns', {
  id: serial('id').primaryKey(),
  organizerId: integer('organizer_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  componentName: varchar('component_name', { length: 255 }).notNull(),
  componentUrl: varchar('component_url', { length: 500 }),
  supplierName: varchar('supplier_name', { length: 255 }),
  supplierCountry: varchar('supplier_country', { length: 100 }),
  // Pricing
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('USD'),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }),
  customsDuty: decimal('customs_duty', { precision: 10, scale: 2 }),
  // Campaign details
  minimumQuantity: integer('minimum_quantity').notNull(),
  maximumQuantity: integer('maximum_quantity'),
  currentQuantity: integer('current_quantity').default(0),
  participantCount: integer('participant_count').default(0),
  // Timeline
  deadline: timestamp('deadline').notNull(),
  estimatedDelivery: timestamp('estimated_delivery'),
  status: groupBuyingStatusEnum('status').notNull().default('open'),
  // Payment
  totalFunding: decimal('total_funding', { precision: 12, scale: 2 }).default('0'),
  targetFunding: decimal('target_funding', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Group buying participants
export const groupBuyingParticipants = pgTable('group_buying_participants', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').notNull().references(() => groupBuyingCampaigns.id),
  userId: integer('user_id').notNull().references(() => users.id),
  quantity: integer('quantity').notNull(),
  contribution: decimal('contribution', { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean('is_paid').default(false),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Component comparison tracking
export const componentComparisons = pgTable('component_comparisons', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  componentIds: text('component_ids').notNull(), // JSON array
  sessionId: varchar('session_id', { length: 100 }),
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

// Project likes/favorites
export const projectLikes = pgTable('project_likes', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Project completions (users who built the project)
export const projectCompletions = pgTable('project_completions', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id),
  userId: integer('user_id').notNull().references(() => users.id),
  images: text('images'), // JSON array of build photos
  notes: text('notes'),
  rating: integer('rating'), // 1-5
  createdAt: timestamp('created_at').defaultNow(),
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

// ===== COMPONENT CATEGORIES HIERARCHY =====

export const componentCategories = pgTable('component_categories', {
  id: varchar('id', { length: 100 }).primaryKey(), // e.g., 'electrical'
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const componentSubcategories = pgTable('component_subcategories', {
  id: varchar('id', { length: 100 }).primaryKey(), // e.g., 'power'
  categoryId: varchar('category_id', { length: 100 }).notNull().references(() => componentCategories.id),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const componentApplications = pgTable('component_applications', {
  id: serial('id').primaryKey(),
  subcategoryId: varchar('subcategory_id', { length: 100 }).notNull().references(() => componentSubcategories.id),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

