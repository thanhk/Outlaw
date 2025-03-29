import axios from 'axios';
import { AuthResponse } from '../store/store';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  rating: number;
  profilePicture?: string;
  createdJobs: number;
  completedJobs: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  reward: number;
  timeEstimate: string;
  status: 'open' | 'in_progress' | 'pending_review' | 'completed' | 'cancelled' | 'expired';
  createdBy: string | {
    _id: string;
    name: string;
    email: string;
    rating: number;
  };
  assignedTo?: string;
  createdAt: Date;
  expiresAt?: Date;
  completedAt?: Date;
  completionRequest?: {
    comment: string;
    submittedAt: Date;
  };
}

interface JobsResponse {
  jobs: Job[];
  total: number;
}

interface JobFilters {
  category?: string;
  status?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  creator?: string;
  assignedTo?: string;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const login = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  const { token, user } = response.data;
  localStorage.setItem('token', token);
  return { user, token };
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}): Promise<AuthResponse> => {
  console.log('Making registration API call:', {
    url: '/auth/register',
    data: userData
  });
  const response = await api.post<AuthResponse>('/auth/register', userData);
  console.log('Registration API response:', response.data);
  const { token, user } = response.data;
  localStorage.setItem('token', token);
  return { user, token };
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Job endpoints
export const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

export const getJob = async (id: string) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (jobData: any) => {
  const response = await api.post('/jobs', jobData);
  return response.data;
};

export const updateJob = async (id: string, jobData: any) => {
  const response = await api.put(`/jobs/${id}`, jobData);
  return response.data;
};

export const deleteJob = async (id: string) => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
};

export const applyForJob = async (id: string) => {
  const response = await api.put(`/jobs/${id}/apply`);
  return response.data;
};

export const submitCompletion = async (jobId: string, comment: string): Promise<Job> => {
  console.log('Making API call to submit completion:', {
    jobId,
    comment
  });
  const response = await api.post<Job>(`/jobs/${jobId}/complete`, {
    comment,
    submittedAt: new Date()
  });
  console.log('API response:', response.data);
  return response.data;
};

export const approveCompletion = async (jobId: string, rating: number): Promise<Job> => {
  const response = await api.post<Job>(`/jobs/${jobId}/approve`, { rating });
  return response.data;
};

export const rejectCompletion = async (jobId: string): Promise<Job> => {
  const response = await api.post<Job>(`/jobs/${jobId}/reject`);
  return response.data;
};

export const userService = {
  create: async (userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get<{ users: User[] }>('/users');
    return response.data.users;
  },

  getById: async (id: string) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, userData: Partial<User>) => {
    const response = await api.put<User>(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export const jobService = {
  create: async (jobData: Omit<Job, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<Job>('/jobs', jobData);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get<Job[]>('/jobs');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  update: async (id: string, jobData: Partial<Job>) => {
    const response = await api.put<Job>(`/jobs/${id}`, jobData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  applyForJob: async (jobId: string): Promise<Job> => {
    const response = await api.put<Job>(`/jobs/${jobId}/apply`);
    return response.data;
  },

  submitCompletion: async (jobId: string, comment: string): Promise<Job> => {
    console.log('Making API call to submit completion:', {
      jobId,
      comment
    });
    const response = await api.post<Job>(`/jobs/${jobId}/complete`, {
      comment,
      submittedAt: new Date()
    });
    console.log('API response:', response.data);
    return response.data;
  },

  approveCompletion: async (jobId: string, rating: number): Promise<Job> => {
    const response = await api.post<Job>(`/jobs/${jobId}/approve`, { rating });
    return response.data;
  },

  rejectCompletion: async (jobId: string): Promise<Job> => {
    const response = await api.post<Job>(`/jobs/${jobId}/reject`);
    return response.data;
  }
};

export default api; 