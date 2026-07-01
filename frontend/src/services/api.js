import axios from 'axios';

const AUTH_STORAGE_KEY = 'healthAppAuth';
const apiBaseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export const getStoredAuth = () => {
  try {
    const value = localStorage.getItem(AUTH_STORAGE_KEY);

    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

export const getStoredUser = () => {
  const auth = getStoredAuth();

  return auth?.email ? { email: auth.email } : null;
};

export const saveAuth = ({ email, token }) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email, token }));
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const auth = getStoredAuth();

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

export default api;
