import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with auto-retry
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Auto-retry on network errors (max 2 retries)
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      if (originalRequest._retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return api(originalRequest);
      }
    }

    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const errorResponse = {
      message: error.response?.data?.message || 'Network error. Please try again.',
      code: error.response?.data?.code || 'NETWORK_ERROR',
      status: error.response?.status
    };

    return Promise.reject(errorResponse);
  }
);

// API methods with caching
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const pollAPI = {
  getAll: async () => {
    const cached = getCached('polls');
    if (cached) return cached;
    const data = await api.get('/polls');
    setCache('polls', data);
    return data;
  },
  create: async (data) => {
    const result = await api.post('/polls', data);
    cache.delete('polls'); // Invalidate cache
    return result;
  },
  getById: (pollId) => api.get(`/polls/${pollId}`),
  getResults: (pollId) => api.get(`/polls/${pollId}/results`)
};

export const voteAPI = {
  submit: (data) => api.post('/vote', data),
  checkStatus: (data) => api.post('/vote/check', data)
};

export default api;
