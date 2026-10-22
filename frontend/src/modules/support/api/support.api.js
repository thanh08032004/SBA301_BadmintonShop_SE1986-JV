import { sendShopAction } from '@/app/providers/shop/shop.api';

// Each function returns the new store snapshot from the mock API.
export const supportApi = {
  createTicket: (payload) => sendShopAction({ type: 'create_support_ticket', ...payload }),
  updateTicket: (payload) => sendShopAction({ type: 'update_support_ticket', ...payload }),
};
