import axios from 'axios';

const normalizeApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (!configuredUrl) {
    return 'http://localhost:3010/api/v1';
  }

  return configuredUrl.endsWith('/api/v1')
    ? configuredUrl
    : `${configuredUrl.replace(/\/$/, '')}/api/v1`;
};

export const apiBaseUrl = normalizeApiUrl();
export const apiOriginUrl = apiBaseUrl.replace(/\/api\/v1$/, '');

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear storage and redirect to login if unauthorized
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
