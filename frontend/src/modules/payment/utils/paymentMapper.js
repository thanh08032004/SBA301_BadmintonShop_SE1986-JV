import { paymentMethodNames, transactionStatuses } from '../constants/paymentConstants';

export const formatPrice = (price) => `${price.toLocaleString('vi-VN')}₫`;

export const isValidPayment = (payment) => (
  Boolean(payment)
  && Number.isFinite(payment.total)
  && Boolean(paymentMethodNames[payment.paymentMethod])
);

export const getTransactionStatus = (status) => transactionStatuses[status] ?? null;
