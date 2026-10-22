import { httpClient } from '@/shared/api/httpClient';

export const authApi = {
  login: (credentials) => httpClient.post('/auth/login', credentials),
};
