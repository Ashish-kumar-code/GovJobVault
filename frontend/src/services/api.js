import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const profilesAPI = {
  create: (data) => api.post('/profiles', data),
  getAll: () => api.get('/profiles'),
  getById: (id) => api.get(`/profiles/${id}`),
  update: (id, data) => api.put(`/profiles/${id}`, data),
  delete: (id) => api.delete(`/profiles/${id}`),
  setDefault: (id) => api.put(`/profiles/${id}/set-default`),
};

export const documentsAPI = {
  upload: (profileId, formData) =>
    api.post(`/profiles/${profileId}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (profileId) => api.get(`/profiles/${profileId}/documents`),
  download: (profileId, type) =>
    api.get(`/profiles/${profileId}/documents/${type}/download`, { responseType: 'blob' }),
};

export const toolsAPI = {
  resize: (formData) =>
    api.post('/tools/resize', formData, { headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'blob' }),
  combineAadhaar: (formData) =>
    api.post('/tools/combine-aadhaar', formData, { headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'blob' }),
};

export const applicationsAPI = {
  create: (data) => api.post('/applications', data),
  getAll: () => api.get('/applications'),
  getById: (id) => api.get(`/applications/${id}`),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  getUpcoming: () => api.get('/applications/upcoming'),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const resumeAPI = {
  generate: (profileId) =>
    api.post('/resume/generate', { profileId }, { responseType: 'blob' }),
};

export default api;

