import api from './api';

// Search API
export const searchAPI = {
  search: async (query: string, type?: string) => {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    const response = await api.get(`/api/search?${params.toString()}`);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (unreadOnly: boolean = false, limit: number = 20) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (unreadOnly) params.append('unreadOnly', 'true');
    const response = await api.get(`/api/notifications?${params.toString()}`);
    return response.data;
  },

  markAsRead: async (id: number) => {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/api/notifications/read-all');
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/notifications/${id}`);
    return response.data;
  },
};

// Quotes API
export const quotesAPI = {
  create: async (data: {
    serviceId: number;
    projectDescription: string;
    specifications?: any;
  }) => {
    const response = await api.post('/api/quotes', data);
    return response.data;
  },

  getAll: async (type?: 'requested' | 'received') => {
    const params = type ? `?type=${type}` : '';
    const response = await api.get(`/api/quotes${params}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/quotes/${id}`);
    return response.data;
  },

  update: async (id: number, data: {
    estimatedPrice?: number;
    estimatedDuration?: number;
    notes?: string;
    status?: string;
  }) => {
    const response = await api.patch(`/api/quotes/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, status: 'approved' | 'rejected') => {
    const response = await api.patch(`/api/quotes/${id}/status`, { status });
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadSingle: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const response = await api.post('/api/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getPresignedUrl: async (fileName: string, contentType: string) => {
    const response = await api.get('/api/upload/presigned-url', {
      params: { fileName, contentType },
    });
    return response.data;
  },

  delete: async (fileUrl: string) => {
    const response = await api.delete('/api/upload', { data: { fileUrl } });
    return response.data;
  },
};

// Components API (existing endpoints, added for completeness)
export const componentsAPI = {
  getCategories: async () => {
    const response = await api.get('/api/components/categories');
    return response.data;
  },
  getFilters: async (filters?: { type?: string }) => {
    const response = await api.get('/api/components/filters', { params: filters });
    return response.data as { locations: string[]; types: string[] };
  },
  getAll: async (filters?: {
    type?: string | string[];
    location?: string | string[];
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.type) {
      const types = Array.isArray(filters.type) ? filters.type : String(filters.type).split(',').map(s => s.trim()).filter(Boolean);
      types.forEach(t => params.append('type', t));
    }
    if (filters?.location) {
      const locations = Array.isArray(filters.location) ? filters.location : String(filters.location).split(',').map(s => s.trim()).filter(Boolean);
      locations.forEach(l => params.append('location', l));
    }
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/api/components?${params.toString()}`);
    return response.data; // Now returns { data: [], page, limit, hasMore }
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/components/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/api/components', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/api/components/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/components/${id}`);
    return response.data;
  },
};

// Services API (existing endpoints, added for completeness)
export const servicesAPI = {
  getFilters: async (filters?: { category?: string }) => {
    const response = await api.get('/api/services/filters', { params: filters });
    return response.data as { locations: string[]; categories: string[] };
  },
  getAll: async (filters?: {
    category?: string | string[];
    location?: string | string[];
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) {
      const cats = Array.isArray(filters.category) ? filters.category : String(filters.category).split(',').map(s => s.trim()).filter(Boolean);
      cats.forEach(c => params.append('category', c));
    }
    if (filters?.location) {
      const locations = Array.isArray(filters.location) ? filters.location : String(filters.location).split(',').map(s => s.trim()).filter(Boolean);
      locations.forEach(l => params.append('location', l));
    }
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/api/services?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/services/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/api/services', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/api/services/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/services/${id}`);
    return response.data;
  },
};


// Wishlist API
export const wishlistAPI = {
  getAll: async () => {
    const response = await api.get('/api/wishlist');
    return response.data;
  },

  add: async (data: { componentId?: number; serviceId?: number }) => {
    const response = await api.post('/api/wishlist', data);
    return response.data;
  },

  remove: async (id: number) => {
    const response = await api.delete(`/api/wishlist/${id}`);
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async () => {
    const response = await api.get('/api/orders');
    return response.data;
  },

  create: async (data: {
    componentId: number;
    quantity: number;
    notes?: string;
  }) => {
    const response = await api.post('/api/orders', data);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/api/orders/${id}/status`, { status });
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    const response = await api.get('/api/bookings');
    return response.data;
  },

  create: async (data: {
    serviceId: number;
    startDate: string;
    projectSpecs?: string;
    notes?: string;
  }) => {
    const response = await api.post('/api/bookings', data);
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/api/bookings/${id}/status`, { status });
    return response.data;
  },
};

// Community API
export const communityAPI = {
  getAll: async (filters?: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const response = await api.get(`/api/community?${params.toString()}`);
    return response.data;
  },

  getPosts: async (filters?: {
    category?: string;
    status?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const response = await api.get(`/api/community?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number, incrementView: boolean = true) => {
    const response = await api.get(`/api/community/${id}?incrementView=${incrementView}`);
    return response.data;
  },

  getPostById: async (id: number) => {
    const response = await api.get(`/api/community/posts/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/api/community', data);
    return response.data;
  },

  createPost: async (data: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    images?: string[];
  }) => {
    const response = await api.post('/api/community/posts', data);
    return response.data;
  },

  getReplies: async (postId: number) => {
    const response = await api.get(`/api/community/posts/${postId}/replies`);
    return response.data;
  },

  createReply: async (postId: number, content: string) => {
    const response = await api.post(`/api/community/${postId}/replies`, { content });
    return response.data;
  },

  addReply: async (postId: number, content: string) => {
    const response = await api.post(`/api/community/posts/${postId}/replies`, { content });
    return response.data;
  },

  updateStatus: async (postId: number, status: string) => {
    const response = await api.patch(`/api/community/${postId}/status`, { status });
    return response.data;
  },
};

// Cart API
export const cartAPI = {
  getCart: async () => {
    const response = await api.get('/api/cart');
    return response.data;
  },

  addItem: async (item: {
    componentId?: number;
    affiliateStoreId?: number;
    campaignId?: number;
    quantity: number;
    price: string | number;
    externalProductId?: string;
    externalProductUrl?: string;
    productName?: string;
    productImage?: string;
  }) => {
    const response = await api.post('/api/cart/items', item);
    return response.data;
  },

  updateItemQuantity: async (itemId: number, quantity: number) => {
    const response = await api.put(`/api/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  removeItem: async (itemId: number) => {
    const response = await api.delete(`/api/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/api/cart');
    return response.data;
  },

  importAffiliateCart: async (affiliateStoreId: number, items: any[]) => {
    const response = await api.post('/api/cart/import-affiliate', {
      affiliateStoreId,
      items,
    });
    return response.data;
  },
};

// Email Verification API
export const emailVerificationAPI = {
  sendCode: async (email: string) => {
    const response = await api.post('/api/email-verification/send-code', { email });
    return response.data;
  },

  verifyCode: async (email: string, code: string) => {
    const response = await api.post('/api/email-verification/verify-code', { email, code });
    return response.data;
  },

  checkStatus: async (email: string) => {
    const response = await api.get('/api/email-verification/check-status', {
      params: { email },
    });
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (filters?: {
    category?: string;
    difficulty?: string;
    search?: string;
    authorId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.authorId) params.append('authorId', filters.authorId);

    const response = await api.get(`/api/projects?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/api/projects', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/api/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
  },

  like: async (id: number) => {
    const response = await api.post(`/api/projects/${id}/like`);
    return response.data;
  },

  markComplete: async (id: number, data: { images?: string[]; notes?: string; rating?: number }) => {
    const response = await api.post(`/api/projects/${id}/complete`, data);
    return response.data;
  },

  addBomItem: async (id: number, data: any) => {
    const response = await api.post(`/api/projects/${id}/bom`, data);
    return response.data;
  },

  removeBomItem: async (projectId: number, bomId: number) => {
    const response = await api.delete(`/api/projects/${projectId}/bom/${bomId}`);
    return response.data;
  },

  addBomToCart: async (id: number) => {
    const response = await api.post(`/api/projects/${id}/bom/add-to-cart`);
    return response.data;
  },
};

// Project Assets & Pipelines API
export const projectAssetsAPI = {
  getByProject: async (projectId: number) => {
    const response = await api.get(`/api/projects/${projectId}/assets`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/project-assets/${id}`);
    return response.data;
  },

  getPipelines: async (projectId: number) => {
    const response = await api.get(`/api/projects/${projectId}/pipelines`);
    return response.data;
  },

  getExecutions: async (pipelineId: number) => {
    const response = await api.get(`/api/pipelines/${pipelineId}/executions`);
    return response.data;
  },

  triggerExecution: async (pipelineId: number, assetId?: number) => {
    const response = await api.post(`/api/pipelines/${pipelineId}/executions`, { assetId });
    return response.data;
  },
};

// Mentorship API
export const mentorshipAPI = {
  getAllRequests: async (filters?: {
    status?: string;
    mentorId?: string;
    menteeId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.mentorId) params.append('mentorId', filters.mentorId);
    if (filters?.menteeId) params.append('menteeId', filters.menteeId);

    const response = await api.get(`/api/mentorship?${params.toString()}`);
    return response.data;
  },

  getMentors: async () => {
    const response = await api.get('/api/mentorship/mentors');
    return response.data;
  },

  getRequestById: async (id: number) => {
    const response = await api.get(`/api/mentorship/${id}`);
    return response.data;
  },

  createRequest: async (data: {
    mentorId?: number;
    topic: string;
    description: string;
    goals?: string;
  }) => {
    const response = await api.post('/api/mentorship', data);
    return response.data;
  },

  updateRequest: async (id: number, data: any) => {
    const response = await api.put(`/api/mentorship/${id}`, data);
    return response.data;
  },

  acceptRequest: async (id: number) => {
    const response = await api.post(`/api/mentorship/${id}/accept`);
    return response.data;
  },

  completeRequest: async (id: number) => {
    const response = await api.post(`/api/mentorship/${id}/complete`);
    return response.data;
  },

  registerAsMentor: async (data: {
    mentorshipAreas: string[];
    mentorBio: string;
  }) => {
    const response = await api.post('/api/mentorship/register-mentor', data);
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get('/api/mentorship/dashboard/stats');
    return response.data;
  },
  getDashboardMentees: async () => {
    const response = await api.get('/api/mentorship/dashboard/mentees');
    return response.data;
  },
};

// Group Buying API
export const groupBuyingAPI = {
  getAllCampaigns: async (filters?: {
    status?: string;
    category?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);

    const response = await api.get(`/api/group-buying?${params.toString()}`);
    return response.data;
  },

  getCampaignById: async (id: number) => {
    const response = await api.get(`/api/group-buying/${id}`);
    return response.data;
  },

  createCampaign: async (data: any) => {
    const response = await api.post('/api/group-buying', data);
    return response.data;
  },

  pledge: async (id: number, quantity: number) => {
    const response = await api.post(`/api/group-buying/${id}/pledge`, { quantity });
    return response.data;
  },
};

// Affiliates API
export const affiliatesAPI = {
  getAllProducts: async (filters?: {
    category?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/api/affiliates/products?${params.toString()}`);
    return response.data;
  },

  trackClick: async (productId: number) => {
    const response = await api.post(`/api/affiliates/products/${productId}/click`);
    return response.data;
  },
  syncStoreProducts: async (storeId: number) => {
    const response = await api.post(`/api/affiliates/${storeId}/sync`);
    return response.data;
  },
};

// Verification API
export const verificationAPI = {
  submit: async (data: { documentType: string; documentUrl: string }) => {
    const response = await api.post('/api/verification/submit', data);
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get('/api/verification/status');
    return response.data;
  },
  getPending: async () => {
    const response = await api.get('/api/verification/pending');
    return response.data;
  },
  review: async (id: number, data: { status: string; reviewNotes?: string; verificationStatus?: string }) => {
    const response = await api.post(`/api/verification/${id}/review`, data);
    return response.data;
  },
};

// Forum API
export const forumAPI = {
  getCategories: async () => {
    const response = await api.get('/api/forum/categories');
    return response.data;
  },

  getThreads: async (categoryId?: number) => {
    const url = categoryId
      ? `/api/forum/categories/${categoryId}/threads`
      : '/api/forum/threads';
    const response = await api.get(url);
    return response.data;
  },

  getThreadById: async (id: number) => {
    const response = await api.get(`/api/forum/threads/${id}`);
    return response.data;
  },

  createThread: async (data: {
    categoryId: number;
    title: string;
    content: string;
  }) => {
    const response = await api.post('/api/forum/threads', data);
    return response.data;
  },

  replyToThread: async (threadId: number, content: string) => {
    const response = await api.post(`/api/forum/threads/${threadId}/posts`, { content });
    return response.data;
  },

  createCategory: async (data: {
    name: string;
    description: string;
    icon?: string;
    sortOrder?: number;
  }) => {
    const response = await api.post('/api/forum/categories', data);
    return response.data;
  },
};

// Blog API
export const blogAPI = {
  getPosts: async (filters?: {
    page?: number;
    limit?: number;
    status?: 'all' | 'draft' | 'published' | 'archived';
    viewerId?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.status) params.append('status', filters.status);
    if (filters?.viewerId) params.append('viewerId', String(filters.viewerId));

    const response = await api.get(`/api/blog/posts?${params.toString()}`);
    return response.data;
  },

  getPostById: async (id: number, viewerId?: number) => {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewerId', String(viewerId));
    const query = params.toString();
    const response = await api.get(`/api/blog/posts/${id}${query ? `?${query}` : ''}`);
    return response.data;
  },

  createPost: async (data: {
    title: string;
    content: string;
    htmlContent: string;
    status?: 'draft' | 'published' | 'archived';
    files?: File[];
  }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('htmlContent', data.htmlContent);
    if (data.status) formData.append('status', data.status);
    data.files?.forEach((file) => formData.append('files', file));

    const response = await api.post('/api/blog/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updatePost: async (
    id: number,
    data: {
      title?: string;
      content?: string;
      htmlContent?: string;
      status?: 'draft' | 'published' | 'archived';
      files?: File[];
    }
  ) => {
    const formData = new FormData();
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.content !== undefined) formData.append('content', data.content);
    if (data.htmlContent !== undefined) formData.append('htmlContent', data.htmlContent);
    if (data.status !== undefined) formData.append('status', data.status);
    data.files?.forEach((file) => formData.append('files', file));

    const response = await api.put(`/api/blog/posts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletePost: async (id: number) => {
    const response = await api.delete(`/api/blog/posts/${id}`);
    return response.data;
  },

  toggleLike: async (postId: number) => {
    const response = await api.post(`/api/blog/posts/${postId}/like`);
    return response.data;
  },

  trackShare: async (postId: number) => {
    const response = await api.post(`/api/blog/posts/${postId}/share`);
    return response.data;
  },

  getComments: async (postId: number, viewerId?: number) => {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewerId', String(viewerId));
    const query = params.toString();
    const response = await api.get(`/api/blog/posts/${postId}/comments${query ? `?${query}` : ''}`);
    return response.data;
  },

  addComment: async (postId: number, content: string, parentCommentId?: number) => {
    const response = await api.post(`/api/blog/posts/${postId}/comments`, {
      content,
      parentCommentId,
    });
    return response.data;
  },

  toggleCommentLike: async (commentId: number) => {
    const response = await api.post(`/api/blog/comments/${commentId}/like`);
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  initialize: async (quoteId: number) => {
    const response = await api.post(`/api/payments/initialize/${quoteId}`);
    return response.data;
  },
  initializeCart: async () => {
    const response = await api.post('/api/payments/checkout/cart');
    return response.data;
  },
  verify: async (reference: string) => {
    const response = await api.get(`/api/payments/verify/${reference}`);
    return response.data;
  },
};
