import { paymentMethodNames, transactionStatuses } from '@/modules/payment/constants';

export const isValidPayment = (payment) =>
  Boolean(payment) &&
  Number.isFinite(payment.total) &&
  Boolean(paymentMethodNames[payment.paymentMethod]);

export const getTransactionStatus = (status) => transactionStatuses[status] ?? null;
