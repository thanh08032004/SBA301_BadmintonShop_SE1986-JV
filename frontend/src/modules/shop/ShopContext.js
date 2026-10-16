import { createContext, useContext } from 'react';
export const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);
export const money = n => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(n);
