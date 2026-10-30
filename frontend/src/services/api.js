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

// Resolve backend API URL (supports VITE_API_URL, VITE_API_KEY, VITE_BACKEND_URL, etc.)
const resolveApiBaseUrl = () => {
  let envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_KEY ||
    import.meta.env.VITE_API_ENDPOINT ||
    ''
  ).trim().replace(/\/+$/, '');

  if (!envUrl) return 'http://localhost:8000/api/v1';

  // Automatically prepend https:// if protocol was omitted
  if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
    envUrl = `https://${envUrl}`;
  }

  return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
};

// Setup Axios API client
const api = axios.create({
  baseURL: resolveApiBaseUrl(),
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

// Helper to get from local storage safely
export const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

// Helper to save to local storage safely
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

// Helper to get audit logs
export const getAuditLogs = () => {
  return getFromStorage(KEYS.AUDIT_LOGS) || [];
};

// Helper to append an audit log entry (fallback for mocks)
export const addAuditLog = (action, userRole, description) => {
  const logs = getAuditLogs();
  const newLog = {
    id: `LOG${String(logs.length + 1).padStart(3, '0')}`,
    action,
    userRole,
    description,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  saveToStorage(KEYS.AUDIT_LOGS, logs);
  return newLog;
};

// Generic error extractor for Axios responses
export const getApiErrorMessage = (error) => {
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((err) => `${err.loc?.join('.') || ''}: ${err.msg}`).join(', ');
    }
    if (data.message) return data.message;
  }
  return error.message || 'An unexpected error occurred. Please try again.';
};

import {
  demoCandidates,
  demoCompanies,
  demoInternships,
  demoApplications,
  demoMatchResults,
  demoAdminAnalytics,
  demoAuditLogs,
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
