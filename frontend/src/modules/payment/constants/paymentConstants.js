export const paymentMethods = [
  { id: 'mbbank', name: 'MB Bank', description: 'Quét mã QR bằng ứng dụng ngân hàng MB Bank', mark: 'MB' },
  { id: 'momo', name: 'Ví MoMo', description: 'Thanh toán nhanh bằng ví MoMo', mark: 'M' },
  { id: 'card', name: 'Thẻ quốc tế', description: 'Visa, Mastercard, JCB', mark: 'CARD' },
];

export const paymentMethodNames = {
  mbbank: 'MB Bank',
  momo: 'Ví MoMo',
  card: 'Thanh toán online',
};

export const orderItems = [
  { name: 'Vợt cầu lông Yonex Astrox', detail: '4U / Xanh đen', quantity: 1, price: 1890000 },
  { name: 'Ống cầu lông lông vũ', detail: 'Hộp 12 quả', quantity: 2, price: 420000 },
];

export const shippingFee = 30000;

export const transactionStatuses = {
  success: {
    title: 'Thanh toán thành công',
    description: 'Giao dịch đã được xác nhận. Đơn hàng của bạn đang được xử lý.',
    className: 'payment-result-success',
    icon: '✓',
  },
  failed: {
    title: 'Thanh toán thất bại',
    description: 'Giao dịch chưa hoàn tất. Bạn có thể thử thanh toán lại.',
    className: 'payment-result-failed',
    icon: '!',
  },
  pending: {
    title: 'Đang chờ thanh toán',
    description: 'Giao dịch chưa được xác nhận. Vui lòng kiểm tra lại sau.',
    className: 'payment-result-pending',
    icon: '…',
  },
};
