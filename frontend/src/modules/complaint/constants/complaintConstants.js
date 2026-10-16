export const complaintStats = [
  { label: 'Tổng yêu cầu', value: '0', tone: 'blue', icon: 'T' },
  { label: 'Chờ xử lý', value: '0', tone: 'amber', icon: 'C' },
  { label: 'Đang xử lý', value: '0', tone: 'violet', icon: 'Đ' },
  { label: 'Đã giải quyết', value: '0', tone: 'green', icon: 'X' },
];

export const complaintStatuses = [
  { label: 'Chờ xử lý', count: 0, tone: 'pending' },
  { label: 'Đang xử lý', count: 0, tone: 'progress' },
  { label: 'Đã giải quyết', count: 0, tone: 'done' },
];

export const complaintWorkflowSteps = [
  {
    number: '01',
    title: 'Tiếp nhận',
    description: 'Ghi nhận phản ánh và xác minh thông tin đơn hàng.',
  },
  {
    number: '02',
    title: 'Xử lý',
    description: 'Phân công nhân viên và cập nhật tiến độ cho khách hàng.',
  },
  {
    number: '03',
    title: 'Hoàn tất',
    description: 'Thông báo kết quả và lưu lại phương án giải quyết.',
  },
];
