import { httpClient } from '@/shared/api/httpClient';

// The server checks for duplicate emails and normalizes the payload.
export const adminApi = {
  getUsers: (params = {}) => httpClient.get('/users', { params }),
  getUserById: (id) => httpClient.get(`/users/${id}`),
  createUser: (userData) => httpClient.post('/users', userData),
  updateUser: (id, updateData) => httpClient.patch(`/users/${id}`, updateData),
};
