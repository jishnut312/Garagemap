import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Mechanic {
  id: number;
  name: string;
  phone: string;
  workshop_name: string;
  latitude: number;
  longitude: number;
  services: string[];
  rating: number;
  is_open: boolean;
  photo?: string;
  reviews_count: number;
}

export interface ServiceRequest {
  id: number;
  user_id: string;
  mechanic_id: number;
  service_type: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  vehicle_details?: {
    type: string;
    model: string;
    year: number;
  };
}

// API Functions
export const mechanicAPI = {
  // Get all mechanics
  getAll: async (): Promise<Mechanic[]> => {
    const response = await api.get('/mechanics/');
    return response.data;
  },

  // Get mechanics by location
  getNearby: async (lat: number, lng: number, radius: number = 10): Promise<Mechanic[]> => {
    const response = await api.get(`/mechanics/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
  },

  // Search mechanics by service type
  searchByService: async (serviceType: string): Promise<Mechanic[]> => {
    const response = await api.get(`/mechanics/search/?service=${serviceType}`);
    return response.data;
  },

  // Get mechanic by ID
  getById: async (id: number): Promise<Mechanic> => {
    const response = await api.get(`/mechanics/${id}/`);
    return response.data;
  },
};

export const requestAPI = {
  // Create service request
  create: async (requestData: Partial<ServiceRequest>): Promise<ServiceRequest> => {
    const response = await api.post('/service-requests/', requestData);
    return response.data;
  },

  // Get user's requests
  getUserRequests: async (_userId: string): Promise<ServiceRequest[]> => {
    const response = await api.get('/service-requests/');
    return response.data;
  },

  // Update request status
  updateStatus: async (id: number, status: string): Promise<ServiceRequest> => {
    const response = await api.patch(`/service-requests/${id}/`, { status });
    return response.data;
  },

  // Get request by ID
  getById: async (id: number): Promise<ServiceRequest> => {
    const response = await api.get(`/service-requests/${id}/`);
    return response.data;
  },
};

export const userAPI = {
  // Create/update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post('/users/profile/', userData);
    return response.data;
  },

  // Get user profile
  getProfile: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}/`);
    return response.data;
  },
};

export default api;
