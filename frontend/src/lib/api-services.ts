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
  getAll: async (filters?: {
    type?: string;
    location?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.location) params.append('location', filters.location);
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
  getAll: async (filters?: {
    category?: string;
    location?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.location) params.append('location', filters.location);
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

// Community API (existing endpoints, added for completeness)
export const communityAPI = {
  getAll: async (filters?: {
    category?: string;
    status?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const response = await api.get(`/api/community?${params.toString()}`);
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/api/community/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/community', data);
    return response.data;
  },
  
  createReply: async (postId: number, content: string) => {
    const response = await api.post(`/api/community/${postId}/replies`, { content });
    return response.data;
  },
  
  updateStatus: async (postId: number, status: string) => {
    const response = await api.patch(`/api/community/${postId}/status`, { status });
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
