export interface User {
  id: number;
  email: string;
  role: 'buyer' | 'seller' | 'service_provider' | 'researcher';
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
  sellerId: number;
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
  buyerId: number;
  sellerId: number;
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
