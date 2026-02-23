import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorResponse = {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };

    if (error.response) {
      // Server responded with error
      errorResponse.message = error.response.data?.error?.message || errorResponse.message;
      errorResponse.code = error.response.data?.error?.code || errorResponse.code;
      errorResponse.status = error.response.status;
    } else if (error.request) {
      // Request made but no response
      errorResponse.message = 'Network error. Please check your connection.';
      errorResponse.code = 'NETWORK_ERROR';
    }

    return Promise.reject(errorResponse);
  }
);

// API methods
export const pollAPI = {
  getAll: () => api.get('/polls'), 
  create: (data) => api.post('/polls', data),
  getById: (pollId) => api.get(`/polls/${pollId}`),
  getResults: (pollId) => api.get(`/polls/${pollId}/results`)
};

export const voteAPI = {
  submit: (data) => api.post('/vote', data),
  checkStatus: (data) => api.post('/vote/check', data)
};

export default api;
