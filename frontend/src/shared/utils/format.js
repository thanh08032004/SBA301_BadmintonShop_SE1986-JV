const moneyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const numberFormatter = new Intl.NumberFormat('vi-VN');

export const formatMoney = (value) => moneyFormatter.format(Number(value) || 0);

export const formatNumber = (value) => numberFormatter.format(Number(value) || 0);

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value, fallback = 'Chưa cập nhật') {
  const date = toDate(value);
  return date
    ? date.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
    : fallback;
}

export function formatDate(value, fallback = 'Chưa cập nhật') {
  const date = toDate(value);
  return date ? date.toLocaleDateString('vi-VN') : fallback;
}
