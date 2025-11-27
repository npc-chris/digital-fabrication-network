export interface User {
  id: number;
  email: string;
  role: 'explorer' | 'provider';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  company?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatar?: string;
  portfolio?: string;
  rating: string;
  reviewCount: number;
}

export interface Component {
  id: number;
  providerId: number;
  name: string;
  description?: string;
  type: 'electrical' | 'mechanical' | 'materials' | 'consumables';
  price: string;
  availability: number;
  images?: string;
  technicalDetails?: string;
  datasheetUrl?: string;
  compatibilities?: string;
  location?: string;
  rating: string;
  reviewCount: number;
  // Enhanced aggregation fields
  supplierType?: 'local' | 'african' | 'international';
  isAffiliate?: boolean;
  affiliateStoreId?: number;
  externalUrl?: string;
  shippingTime?: number;
  localPriority?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  providerId: number;
  name: string;
  description?: string;
  category?: string;
  equipmentSpecs?: string;
  pricingModel?: string;
  pricePerUnit?: string;
  leadTime?: number;
  images?: string;
  location?: string;
  rating: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  explorerId: number;
  providerId: number;
  componentId: number;
  quantity: number;
  totalPrice: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  serviceId: number;
  userId: number;
  providerId: number;
  startDate: string;
  endDate?: string;
  status: 'queued' | 'in_progress' | 'completed' | 'pickup' | 'delivery';
  projectSpecs?: string;
  totalCost?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPost {
  id: number;
  authorId: number;
  title: string;
  content: string;
  category?: string;
  tags?: string;
  images?: string;
  status: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostReply {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  id: number;
  userId: number;
  componentId?: number;
  serviceId?: number;
  createdAt: string;
}

export interface AffiliateStore {
  id: number;
  userId: number;
  storeName: string;
  description?: string;
  website?: string;
  logo?: string;
  location?: string;
  supplierType: 'local' | 'african' | 'international';
  apiEndpoint?: string;
  apiFormat?: string;
  commissionRate: string;
  isActive: boolean;
  isApproved: boolean;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'premium';
  verifiedAt?: string;
  totalSales: number;
  totalRevenue: string;
  rating: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  authorId: number;
  title: string;
  description: string;
  category?: string;
  tags?: string;
  images?: string;
  visibility: 'public' | 'unlisted' | 'private';
  difficulty?: string;
  estimatedCost?: string;
  estimatedTime?: number;
  instructions?: string;
  toolsRequired?: string;
  isOpenForCollaboration: boolean;
  collaborators?: string;
  viewCount: number;
  likeCount: number;
  forkCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectBom {
  id: number;
  projectId: number;
  componentName: string;
  componentId?: number;
  quantity: number;
  unitPrice?: string;
  supplier?: string;
  notes?: string;
  alternativeComponents?: string;
  sortOrder: number;
  createdAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  cartId: number;
  componentId?: number;
  affiliateStoreId?: number;
  quantity: number;
  price: string;
  externalProductId?: string;
  externalProductUrl?: string;
  productName?: string;
  productImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForumThread {
  id: number;
  authorId: number;
  categoryId?: number;
  title: string;
  content: string;
  tags?: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  createdAt: string;
}

export interface ForumReply {
  id: number;
  threadId: number;
  authorId: number;
  content: string;
  parentReplyId?: number;
  likeCount: number;
  isAcceptedAnswer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipRequest {
  id: number;
  menteeId: number;
  mentorId?: number;
  topic: string;
  description: string;
  goals?: string;
  status: 'open' | 'matched' | 'active' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupBuyingCampaign {
  id: number;
  organizerId: number;
  title: string;
  description: string;
  componentName: string;
  componentUrl?: string;
  supplierName?: string;
  supplierCountry?: string;
  unitPrice: string;
  currency: string;
  shippingCost?: string;
  customsDuty?: string;
  minimumQuantity: number;
  maximumQuantity?: number;
  currentQuantity: number;
  participantCount: number;
  deadline: string;
  estimatedDelivery?: string;
  status: 'open' | 'funding' | 'ordered' | 'shipped' | 'completed' | 'cancelled';
  totalFunding: string;
  targetFunding?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupBuyingParticipant {
  id: number;
  campaignId: number;
  userId: number;
  quantity: number;
  contribution: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

export interface VerificationDocument {
  id: number;
  userId: number;
  documentType: string;
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: number;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ProjectCompletion {
  id: number;
  projectId: number;
  userId: number;
  images?: string;
  notes?: string;
  rating?: number;
  createdAt: string;
}
