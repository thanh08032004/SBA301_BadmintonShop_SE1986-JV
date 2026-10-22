import { httpClient } from '@/shared/api/httpClient';

// Temporary endpoint of the mock: GET returns the whole store snapshot, POST runs one action
// ({ type, ... }) and returns the new snapshot. Removed when the Spring Boot backend is integrated.
export const fetchShopData = (config) => httpClient.get('/shop', config);

export const sendShopAction = (action) => httpClient.post('/shop', action);
