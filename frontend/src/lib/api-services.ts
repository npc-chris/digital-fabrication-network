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
  getFilters: async (filters?: { type?: string }) => {
    const response = await api.get('/api/components/filters', { params: filters });
    return response.data as { locations: string[]; types: string[] };
  },
  getAll: async (filters?: {
    type?: string | string[];
    location?: string | string[];
    search?: string;
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
    const response = await api.get(`/api/components?${params.toString()}`);
    return response.data;
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
  }) => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
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
