import { sendShopAction } from '@/app/providers/shop/shop.api';

// Each function returns the new store snapshot from the mock API.
// When the backend is ready, status updates arrive over WebSocket instead of manual sync.
export const deliveryApi = {
  syncCarrierStatus: (payload) => sendShopAction({ type: 'sync_carrier_status', ...payload }),
};
