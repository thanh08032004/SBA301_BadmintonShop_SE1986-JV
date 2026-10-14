import { paymentMethodNames } from '../constants/paymentConstants';

export function getPaymentQrImageUrl(payment) {
  const qrContent = encodeURIComponent(
    `Badminton Shop | ${paymentMethodNames[payment.paymentMethod]} | ${payment.orderCode} | ${payment.total}`
  );
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrContent}`;
}
