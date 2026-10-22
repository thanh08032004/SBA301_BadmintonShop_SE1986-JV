import { sendShopAction } from '@/app/providers/shop/shop.api';

// Each function returns the new store snapshot from the mock API.
export const cartApi = {
  addItem: (variantId) => sendShopAction({ type: 'add', variant_id: variantId }),
  updateItem: (payload) => sendShopAction({ type: 'update', ...payload }),
  removeItem: (itemId) => sendShopAction({ type: 'remove', id: itemId }),
  selectAll: (selected) => sendShopAction({ type: 'select_all', selected }),
};

export const orderApi = {
  checkout: (payload) => sendShopAction({ type: 'checkout', ...payload }),
};
