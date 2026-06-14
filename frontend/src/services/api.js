import axios from 'axios';

const KEYS = {
  CANDIDATES: 'internsetu_candidates',
  COMPANIES: 'internsetu_companies',
  INTERNSHIPS: 'internsetu_internships',
  APPLICATIONS: 'internsetu_applications',
  MATCH_RESULTS: 'internsetu_match_results',
  ADMIN_ANALYTICS: 'internsetu_admin_analytics',
  AUDIT_LOGS: 'internsetu_audit_logs',
  CURRENT_USER: 'internsetu_current_user',
  TOKEN: 'internsetu_token',
};

// Check if Vite mock fallback env is enabled
export const isMockFallbackEnabled = () => {
  return import.meta.env.VITE_USE_MOCK_FALLBACK === 'true';
};

// Setup Axios API client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and current user
      localStorage.removeItem(KEYS.TOKEN);
      localStorage.removeItem(KEYS.CURRENT_USER);
      
      // Redirect to login page if we are not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?unauthorized=true';
      }
    }
    return Promise.reject(error);
  }
);

// Retrieve backend error message
export const getApiErrorMessage = (error) => {
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (typeof data.message === 'string') {
      return data.message;
    }
  }
  return error.message || 'An unexpected error occurred.';
};

// Generic LocalStorage fallbacks (kept to avoid breaking code that uses them)
export const getFromStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Audit Log Mock fallback (for manual triggers when offline)
export const addAuditLog = (action, userRole, description) => {
  const logs = getFromStorage(KEYS.AUDIT_LOGS) || [];
  const newLog = {
    id: `LOG${Date.now().toString(36).toUpperCase()}`,
    action,
    userRole,
    description,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  saveToStorage(KEYS.AUDIT_LOGS, logs);
  return newLog;
};

import {
  demoCandidates,
  demoCompanies,
  demoInternships,
  demoApplications,
  demoMatchResults,
  demoAdminAnalytics,
  demoAuditLogs
} from '../data/demoData';

export const initializeData = () => {
  if (!localStorage.getItem(KEYS.CANDIDATES)) localStorage.setItem(KEYS.CANDIDATES, JSON.stringify(demoCandidates));
  if (!localStorage.getItem(KEYS.COMPANIES)) localStorage.setItem(KEYS.COMPANIES, JSON.stringify(demoCompanies));
  if (!localStorage.getItem(KEYS.INTERNSHIPS)) localStorage.setItem(KEYS.INTERNSHIPS, JSON.stringify(demoInternships));
  if (!localStorage.getItem(KEYS.APPLICATIONS)) localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(demoApplications));
  if (!localStorage.getItem(KEYS.MATCH_RESULTS)) localStorage.setItem(KEYS.MATCH_RESULTS, JSON.stringify(demoMatchResults));
  if (!localStorage.getItem(KEYS.ADMIN_ANALYTICS)) localStorage.setItem(KEYS.ADMIN_ANALYTICS, JSON.stringify(demoAdminAnalytics));
  if (!localStorage.getItem(KEYS.AUDIT_LOGS)) localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(demoAuditLogs));
};

export { KEYS };
export default api;
