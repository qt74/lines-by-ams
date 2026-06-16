import axios from 'axios';
import { demoResponse } from './demoData';

// Showcase mode: no backend (e.g. GitHub Pages). GET requests fall back to
// bundled demo data so visitors can still browse shops & products.
const DEMO = import.meta.env.VITE_DEMO === 'true';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('fm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler
api.interceptors.response.use(
  res => res,
  err => {
    // Showcase mode: serve bundled demo data for GET requests when the API
    // is unavailable, so browsing works without a backend.
    if (DEMO && (err.config?.method || 'get').toLowerCase() === 'get') {
      const body = demoResponse(err.config?.url || '');
      if (body) return Promise.resolve({ data: body, status: 200, demo: true });
    }
    if (!DEMO && err.response?.status === 401) {
      localStorage.removeItem('fm_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
