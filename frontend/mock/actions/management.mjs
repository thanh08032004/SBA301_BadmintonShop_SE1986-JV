import { randomUUID } from 'node:crypto';
import { orderTransitions } from '../../src/modules/management/utils/managementUtils.js';
import { recordOrderStockReturn } from './inventory.mjs';
const check = (ok, message) => {
  if (!ok) throw new Error(message);
};
export function updateManagedOrder(db, action, actor) {
  const order = db.orders.find((o) => String(o.id) === String(action.id));
  check(order, 'Không tìm thấy đơn hàng.');
  check(
    order.status === action.expected_status &&
      order.payment_status === action.expected_payment_status,
    'Đơn hàng vừa được cập nhật. Vui lòng tải lại trước khi xử lý.',
  );
  const next = action.status || order.status;
  const payment = action.payment_status || order.payment_status;
  check(
    next === order.status || orderTransitions[order.status]?.includes(next),
    'Chuyển trạng thái không hợp lệ. Giao hàng được xử lý tại trang quản lý giao hàng.',
  );
  const note = String(action.note || '').trim();
  check(note.length <= 300, 'Ghi chú tối đa 300 ký tự.');
  if (next === 'cancelled' || next === 'returned')
    check(note.length > 0, 'Vui lòng nhập lý do hủy hoặc trả hàng.');
  check(
    ['unpaid', 'paid', 'refunded', 'partially_refunded'].includes(payment),
    'Trạng thái thanh toán không hợp lệ.',
  );
  if (payment !== order.payment_status) {
    const allowed =
      order.payment_status === 'unpaid'
        ? ['paid']
        : order.payment_status === 'paid'
          ? ['refunded']
          : order.payment_status === 'partially_refunded'
            ? ['refunded']
            : [];
    check(allowed.includes(payment), 'Chuyển trạng thái thanh toán không hợp lệ.');
    if (payment === 'paid')
      check(
        !['cancelled', 'returned'].includes(next),
        'Không thể thu tiền cho đơn hủy hoặc đã trả.',
      );
    if (payment === 'refunded')
      check(
        ['cancelled', 'returned'].includes(next),
        'Chỉ ghi nhận hoàn tiền cho đơn hủy hoặc trả hàng.',
      );
  }
  check(next !== order.status || payment !== order.payment_status, 'Chưa có thay đổi để lưu.');
  if (next === 'cancelled' || next === 'returned') {
    check(
      !(db.deliveries || []).some(
        (d) =>
          d.order_id === order.id && !['delivered', 'cancelled', 'returned'].includes(d.status),
      ),
      'Đơn đã có vận đơn đang xử lý. Vui lòng xử lý tại trang giao hàng trước.',
    );
  }
  const now = new Date().toISOString();
  if (next !== order.status) {
    // Restore reserved stock exactly once, on the transition into a terminal state.
    if (['cancelled', 'returned'].includes(next)) {
      for (const item of db.order_items.filter((i) => i.order_id === order.id)) {
        const variant = db.product_variants.find((v) => v.id === item.variant_id);
        if (variant) {
          variant.stock_quantity += item.quantity;
          recordOrderStockReturn(db, order, item, actor, now);
        }
      }
    }
    if (next === 'confirmed') {
      order.confirmed_by = actor;
      order.confirmed_at = now;
    }
    if (next === 'cancelled') {
      order.cancelled_by = actor;
      order.cancelled_at = now;
      order.cancel_reason = note;
    }
  }
  const paymentNote =
    payment === order.payment_status ? '' : `Thanh toán: ${order.payment_status} → ${payment}. `;
  (db.order_status_history ||= []).push({
    id: randomUUID(),
    order_id: order.id,
    from_status: order.status,
    to_status: next,
    changed_by: actor,
    note: paymentNote + note,
    created_at: now,
  });
  order.status = next;
  order.payment_status = payment;
  order.updated_at = now;
  if (paymentNote) {
    for (const entry of db.payments.filter((p) => p.order_id === order.id)) {
      entry.status =
        payment === 'paid' ? 'completed' : payment === 'refunded' ? 'refunded' : entry.status;
      entry.updated_at = now;
    }
  }
}
export function deleteCatalog(db, action, configs) {
  const config = configs[action.table];
  check(config && !config.readonly, 'Không thể xóa catalog này.');
  const rows = db[action.table] || [],
    key = config.key || 'id';
  const row = rows.find((r) => String(r[key]) === String(action.id));
  check(row, 'Bản ghi không tồn tại.');
  const refs = {
    brands: [['products', 'brand_id']],
    categories: [
      ['categories', 'parent_id'],
      ['products', 'category_id'],
    ],
    products: [['order_items', 'product_id']],
    product_variants: [
      ['order_items', 'variant_id'],
      ['cart_items', 'variant_id'],
    ],
    vouchers: [
      ['orders', 'voucher_id'],
      ['voucher_usages', 'voucher_id'],
    ],
  };
  for (const [table, field] of refs[action.table] || [])
    check(
      !(db[table] || []).some((r) => String(r[field]) === String(row[key])),
      'Bản ghi đang được sử dụng. Hãy tạm ẩn thay vì xóa.',
    );
  if (action.table === 'brands' || action.table === 'categories' || action.table === 'products') {
    const type = { brands: 'brand', categories: 'category', products: 'product' }[action.table];
    check(
      !(db.voucher_scopes || []).some(
        (s) => s.scope_type === type && String(s.scope_id) === String(row.id),
      ),
      'Bản ghi đang được dùng trong phạm vi voucher.',
    );
  }
  if (action.table === 'products') {
    const ids = (db.product_variants || []).filter((v) => v.product_id === row.id).map((v) => v.id);
    check(
      !(db.cart_items || []).some((i) => ids.includes(i.variant_id)),
      'Sản phẩm đang có trong giỏ hàng của khách.',
    );
    for (const table of [
      'racket_specs',
      'shoe_specs',
      'apparel_specs',
      'product_variants',
      'product_images',
    ])
      db[table] = (db[table] || []).filter((r) => r.product_id !== row.id);
    db.product_price_history = (db.product_price_history || []).filter(
      (h) => !ids.includes(h.variant_id),
    );
  }
  if (action.table === 'product_variants') {
    check(
      !(db.product_images || []).some((i) => i.variant_id === row.id),
      'Biến thể đang được gắn với hình ảnh.',
    );
    db.product_price_history = (db.product_price_history || []).filter(
      (h) => h.variant_id !== row.id,
    );
  }
  if (action.table === 'vouchers')
    db.voucher_scopes = (db.voucher_scopes || []).filter((s) => s.voucher_id !== row.id);
  db[action.table] = rows.filter((r) => r !== row);
}
