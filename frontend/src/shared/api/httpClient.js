import axios from 'axios';
import { AUTH_EXPIRED_EVENT, clearSession, getToken } from '@/shared/auth/session';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    const status = error.response?.status;
    if (status === 401 && error.config?.headers?.Authorization) {
      clearSession();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    const message = error.response
      ? error.response.data?.message || 'Yêu cầu không thành công. Vui lòng thử lại.'
      : 'Không kết nối được server. Hãy kiểm tra npm run dev hoặc backend.';
    return Promise.reject(Object.assign(new Error(message), { status, cause: error }));
  },
);
