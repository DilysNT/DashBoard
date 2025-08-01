// API utility functions với authentication
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Tạo axios instance với base config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Tour API functions
export const tourAPI = {
  // Lấy tất cả tours
  getAll: () => api.get('/tours'),
  
  // Lấy tours theo status
  getByStatus: (status) => api.get(`/tours/status/${status}`),
  
  // Lấy tour theo ID
  getById: (id) => api.get(`/tours/${id}`),
  
  // Tạo tour mới
  create: (tourData) => api.post('/tours', tourData),
  
  // Cập nhật tour
  update: (id, tourData) => api.put(`/tours/${id}`, tourData),
  
  // Xóa tour
  delete: (id) => api.delete(`/tours/${id}`),
  
  // Cập nhật status tour (duyệt/từ chối)
  updateStatus: (id, status) => api.patch(`/tours/${id}/status`, { status }),
  
  // Lấy tours của agency (client-side filter for now)
  getByAgency: async (agencyId) => {
    const response = await api.get('/tours');
    const allTours = response.data;
    return {
      ...response,
      data: allTours.filter(tour => tour.agency_id === agencyId)
    };
  },
  
  // Lấy tours của agency hiện tại từ user context
  getCurrentAgencyTours: async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const agencyId = user.agency_id;
    if (!agencyId) { throw new Error('Không tìm thấy agency_id cho user này!'); }
    return tourAPI.getByAgency(agencyId);
  },
};

// Destination API functions
export const destinationAPI = {
  getAll: () => api.get('/destinations'),
  create: (data) => api.post('/destinations', data),
  update: (id, data) => api.put(`/destinations/${id}`, data),
  delete: (id) => api.delete(`/destinations/${id}`),
};

// Agency API functions  
export const agencyAPI = {
  getAll: () => api.get('/agencies'),
  getById: (id) => api.get(`/agencies/${id}`),
  update: (id, data) => api.put(`/agencies/${id}`, data),
  updateStatus: (id, status) => api.patch(`/agencies/${id}/status`, { status }),
};

// Customer API functions
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export default api;
