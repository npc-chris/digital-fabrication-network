import api from '@/lib/api';

export type AdminStats = {
  users: { total: number; explorers: number; providers: number };
  content: { components: number; services: number; posts: number };
  pending: { providerRequests: number; verifications: number };
};

export type AdminUser = {
  id: number;
  email: string;
  role: string;
  isVerified: boolean;
  onboardingCompleted: boolean;
  providerApproved: boolean;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  location?: string;
  phone?: string;
  banned?: boolean;
};

export type ProviderRequest = {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  bio?: string;
  location?: string;
  phone?: string;
};

export type VerificationItem = {
  id: number;
  documentType?: string;
  status?: string;
  submittedAt?: string;
  user?: {
    id?: number;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  [key: string]: unknown;
};

export type UsersResponse = {
  users: AdminUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type CommunityPostItem = {
  id: number;
  title: string;
  content: string;
  category?: string;
  status?: string;
  createdAt?: string;
  authorName?: string;
  authorLastName?: string;
  authorCompany?: string;
  replyCount?: number;
};

export type ListingItem = {
  id: number;
  name: string;
  location?: string;
  providerName?: string;
  providerLastName?: string;
  providerCompany?: string;
  createdAt?: string;
};

export type AdminBlogPostItem = {
  id: number;
  authorId: number;
  title: string;
  content: string;
  htmlContent: string;
  status: 'draft' | 'published' | 'archived';
  likeCount: number;
  commentCount: number;
  shareCount: number;
  authorEmail?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminBlogListResponse = {
  data: AdminBlogPostItem[];
  total: number;
};

type VerificationApiResponse = {
  document?: {
    id?: number;
    documentType?: string;
    status?: string;
    createdAt?: string;
  };
  user?: {
    id?: number;
    email?: string;
  };
  profile?: {
    firstName?: string;
    lastName?: string;
  };
};

export const adminClient = {
  async getStats() {
    const response = await api.get<AdminStats>('/api/admin/stats');
    return response.data;
  },

  async getUsers(search: string, role: string, page: number, limit = 20) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role !== 'all') params.append('role', role);
    params.append('page', String(page));
    params.append('limit', String(limit));

    const response = await api.get<UsersResponse>(`/api/admin/users?${params.toString()}`);
    return response.data;
  },

  async getProviderRequests() {
    const response = await api.get<ProviderRequest[]>('/api/admin/provider-requests');
    return response.data;
  },

  async getVerifications() {
    const response = await api.get<VerificationApiResponse[]>('/api/verification/pending');
    return (response.data || [])
      .map((item) => ({
        id: item.document?.id ?? 0,
        documentType: item.document?.documentType,
        status: item.document?.status,
        submittedAt: item.document?.createdAt,
        user: {
          id: item.user?.id,
          email: item.user?.email,
          firstName: item.profile?.firstName,
          lastName: item.profile?.lastName,
        },
      }))
      .filter((item) => item.id > 0);
  },

  async approveProvider(userId: number) {
    await api.patch(`/api/admin/provider-requests/${userId}`, { approved: true });
  },

  async rejectProvider(userId: number, reason?: string) {
    await api.patch(`/api/admin/provider-requests/${userId}`, { approved: false, reason });
  },

  async reviewVerification(id: number, status: 'approved' | 'rejected', notes?: string, verificationStatus = 'verified') {
    await api.post(`/api/verification/${id}/review`, {
      status,
      reviewNotes: notes ?? '',
      verificationStatus,
    });
  },

  async setUserRole(userId: number, role: 'provider' | 'explorer') {
    await api.patch(`/api/admin/users/${userId}/role`, {
      role,
      providerApproved: role === 'provider',
    });
  },

  async setUserBan(userId: number, banned: boolean) {
    await api.patch(`/api/admin/users/${userId}/ban`, { banned });
  },

  async getCommunityPosts(filters: { search?: string; status?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    params.append('page', String(filters.page ?? 1));
    params.append('limit', String(filters.limit ?? 10));

    const response = await api.get<{ data: CommunityPostItem[] }>(`/api/community?${params.toString()}`);
    return response.data;
  },

  async updateCommunityPostStatus(postId: number, status: string) {
    await api.patch(`/api/community/${postId}/status`, { status });
  },

  async getBlogPosts(filters?: { status?: 'all' | 'draft' | 'published' | 'archived'; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    params.append('page', String(filters?.page ?? 1));
    params.append('limit', String(filters?.limit ?? 20));

    const response = await api.get<AdminBlogListResponse>(`/api/blog/posts?${params.toString()}`);
    return response.data;
  },

  async createBlogPost(payload: {
    title: string;
    content: string;
    htmlContent: string;
    status: 'draft' | 'published' | 'archived';
    files: File[];
  }) {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('content', payload.content);
    formData.append('htmlContent', payload.htmlContent);
    formData.append('status', payload.status);
    payload.files.forEach((file) => formData.append('files', file));

    const response = await api.post('/api/blog/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteBlogPost(postId: number) {
    await api.delete(`/api/blog/posts/${postId}`);
  },

  async getComponentListings(search: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', '50');

    const response = await api.get<{ data: ListingItem[] }>(`/api/components?${params.toString()}`);
    return response.data.data || [];
  },

  async getServiceListings(search: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', '50');

    const response = await api.get<{ data: ListingItem[] }>(`/api/services?${params.toString()}`);
    return response.data.data || [];
  },

  async removeComponentListing(componentId: number) {
    await api.delete(`/api/admin/components/${componentId}`);
  },

  async removeServiceListing(serviceId: number) {
    await api.delete(`/api/admin/services/${serviceId}`);
  },
};
