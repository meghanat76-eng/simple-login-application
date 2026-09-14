import axios, { AxiosError } from 'axios';
import {
  User,
  JobApplication,
  ApplicationFormData,
  DashboardStats,
  ApplicationsResponse,
  ApplicationsQueryParams,
} from '../types/index';

// In standalone local setup, backend runs at http://localhost:5000/api.
// In AI Studio preview or when custom VITE_API_URL is configured, use appropriate endpoint.
const getBaseURL = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthorized 401 responses
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Don't auto-redirect if this is a login/register failure
      const isAuthUrl = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },

  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Applications API endpoints
export const applicationsAPI = {
  getAll: async (params?: ApplicationsQueryParams): Promise<ApplicationsResponse> => {
    const res = await api.get('/applications', { params });
    return res.data;
  },

  getById: async (id: number | string): Promise<JobApplication> => {
    const res = await api.get(`/applications/${id}`);
    return res.data;
  },

  create: async (data: ApplicationFormData): Promise<JobApplication> => {
    const res = await api.post('/applications', data);
    return res.data;
  },

  update: async (id: number | string, data: Partial<ApplicationFormData>): Promise<JobApplication> => {
    const res = await api.put(`/applications/${id}`, data);
    return res.data;
  },

  delete: async (id: number | string): Promise<{ message: string; id: number }> => {
    const res = await api.delete(`/applications/${id}`);
    return res.data;
  },
};

// Dashboard API endpoints
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
};
