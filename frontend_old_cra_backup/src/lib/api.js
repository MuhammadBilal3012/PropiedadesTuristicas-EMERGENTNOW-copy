import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (username, password) => {
  const response = await api.post('/auth/register', { username, password });
  return response.data;
};

export const setupAdmin = async () => {
  const response = await api.post('/auth/setup');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword
  });
  return response.data;
};

// User Management
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (username, password, role = 'admin', nombre_completo = null, telefono_whatsapp = null, foto_perfil = null) => {
  const response = await api.post('/users', { 
    username, 
    password, 
    role,
    nombre_completo,
    telefono_whatsapp,
    foto_perfil
  });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userId, profileData) => {
  const response = await api.put(`/users/${userId}/profile`, profileData);
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}/profile`);
  return response.data;
};

// Agency Settings
export const getAgencySettings = async () => {
  const response = await api.get('/agency');
  return response.data;
};

export const updateAgencySettings = async (data) => {
  const response = await api.put('/agency', data);
  return response.data;
};

// Locations
export const getLocations = async (activeOnly = false) => {
  const response = await api.get('/locations', { params: { active_only: activeOnly } });
  return response.data;
};

export const createLocation = async (data) => {
  const response = await api.post('/locations', data);
  return response.data;
};

export const updateLocation = async (id, data) => {
  const response = await api.put(`/locations/${id}`, data);
  return response.data;
};

export const deleteLocation = async (id) => {
  const response = await api.delete(`/locations/${id}`);
  return response.data;
};

// Properties
export const getProperties = async (params = {}) => {
  const response = await api.get('/properties', { params });
  return response.data;
};

export const getFeaturedProperties = async (limit = 6) => {
  const response = await api.get('/properties/featured', { params: { limit } });
  return response.data;
};

export const getProperty = async (id) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

export const createProperty = async (data) => {
  const response = await api.post('/properties', data);
  return response.data;
};

export const updateProperty = async (id, data) => {
  const response = await api.put(`/properties/${id}`, data);
  return response.data;
};

export const deleteProperty = async (id) => {
  const response = await api.delete(`/properties/${id}`);
  return response.data;
};

// Contact
export const sendContactMessage = async (data) => {
  const response = await api.post('/contact', data);
  return response.data;
};

export const getContactMessages = async () => {
  const response = await api.get('/contact');
  return response.data;
};

export const deleteContactMessage = async (id) => {
  const response = await api.delete(`/contact/${id}`);
  return response.data;
};

// File Upload
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Statistics
export const getStatistics = async () => {
  const response = await api.get('/stats');
  return response.data;
};

// Track visit
export const trackVisit = async (page, propertyId = null) => {
  try {
    await api.post('/track/visit', null, { params: { page, property_id: propertyId } });
  } catch (e) {
    // Silent fail for tracking
  }
};

// Seed data
export const seedData = async () => {
  const response = await api.post('/seed');
  return response.data;
};

// Sell Requests
export const getSellRequests = async () => {
  const response = await api.get('/sell-requests');
  return response.data;
};

export const updateSellRequestStatus = async (id, status) => {
  const response = await api.put(`/sell-requests/${id}/status?status=${status}`);
  return response.data;
};

export const deleteSellRequest = async (id) => {
  const response = await api.delete(`/sell-requests/${id}`);
  return response.data;
};

// Job Applications
export const getJobApplications = async () => {
  const response = await api.get('/job-applications');
  return response.data;
};

export const updateJobApplicationStatus = async (id, status) => {
  const response = await api.put(`/job-applications/${id}/status?status=${status}`);
  return response.data;
};

export const deleteJobApplication = async (id) => {
  const response = await api.delete(`/job-applications/${id}`);
  return response.data;
};

// Notifications
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const getWhatsAppLink = async (notificationId) => {
  const response = await api.get(`/notifications/whatsapp-link/${notificationId}`);
  return response.data;
};

export default api;
