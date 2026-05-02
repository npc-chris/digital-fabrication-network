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
