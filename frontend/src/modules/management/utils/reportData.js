import { localDate } from './managementUtils.js';
export function buildReport(data, from = '', to = '') {
  const orders = data.orders.filter((o) => {
    const day = localDate(o.created_at);
    return (!from || day >= from) && (!to || day <= to);
  });
  const earned = orders.filter((o) => o.status === 'completed' && o.payment_status === 'paid');
  const revenue = earned.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const buckets = new Map();
  const ids = new Set(earned.map((o) => o.id));
  const products = new Map();
  for (const order of orders) {
    const month = localDate(order.created_at).slice(0, 7);
    if (!buckets.has(month)) buckets.set(month, { month, revenue: 0, orders: 0 });
    buckets.get(month).orders++;
    if (ids.has(order.id)) buckets.get(month).revenue += Number(order.total_amount);
  }
  for (const item of data.order_items.filter((i) => ids.has(i.order_id))) {
    const product = products.get(item.product_id) || {
      id: item.product_id,
      name: item.product_name,
      quantity: 0,
      revenue: 0,
    };
    product.quantity += Number(item.quantity);
    product.revenue += Number(item.line_total);
    products.set(item.product_id, product);
  }
  return {
    orders,
    earned,
    revenue,
    average: earned.length ? revenue / earned.length : 0,
    subtotal: earned.reduce((s, o) => s + Number(o.subtotal || 0), 0),
    discounts: earned.reduce((s, o) => s + Number(o.discount_amount || 0), 0),
    shipping: earned.reduce((s, o) => s + Number(o.shipping_fee || 0), 0),
    awaitingPayment: orders
      .filter((o) => !['cancelled', 'returned'].includes(o.status) && o.payment_status === 'unpaid')
      .reduce((s, o) => s + Number(o.total_amount), 0),
    months: [...buckets.values()].sort((a, b) => a.month.localeCompare(b.month)),
    topProducts: [...products.values()].sort((a, b) => b.revenue - a.revenue),
  };
}
