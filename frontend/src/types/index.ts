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

export interface EmailVerificationCode {
  id: number;
  email: string;
  code: string;
  expiresAt: string;
}
