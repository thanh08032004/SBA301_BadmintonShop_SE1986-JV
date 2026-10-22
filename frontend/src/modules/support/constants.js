export const ticketTypes = {
  return: 'Đổi trả',
  exchange: 'Đổi sản phẩm',
  warranty: 'Bảo hành',
  complaint: 'Khiếu nại',
};

export const ticketStatuses = {
  open: { label: 'Mới gửi', variant: 'primary' },
  under_review: { label: 'Đang xem xét', variant: 'warning' },
  approved: { label: 'Đã chấp thuận', variant: 'success' },
  rejected: { label: 'Từ chối', variant: 'danger' },
  resolved: { label: 'Đã hoàn tất', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'secondary' },
};

export const resolutionTypes = {
  refund: 'Hoàn tiền',
  exchange: 'Đổi sản phẩm',
  repair: 'Sửa chữa',
  none: 'Không áp dụng',
};

export const manageableTicketStatuses = [
  'under_review',
  'approved',
  'rejected',
  'resolved',
  'cancelled',
];
