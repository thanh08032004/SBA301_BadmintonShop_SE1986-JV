import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Sample catalog details only. Never creates orders, payments, price history or voucher usages.
export function seedManagementCatalog(db) {
  const append = (table, key, row) => {
    db[table] ||= [];
    if (!db[table].some(r => String(r[key]) === String(row[key]))) db[table].push({ ...row, is_demo: true });
  };
  for (const product of db.products) {
    const id = product.id;
    if (product.product_type === 'racket') append('racket_specs', 'product_id', { product_id: id, balance_type: 'even', flex: 'medium', play_style: 'all_round', max_tension_lbs: 28, material: 'Thông số mẫu — cập nhật theo nhà sản xuất', shaft_diameter: 7 });
    if (product.product_type === 'shoes') append('shoe_specs', 'product_id', { product_id: id, gender: 'unisex', sole_type: 'Đế cao su (mẫu)', technology: 'Thông tin mẫu — cập nhật theo nhà sản xuất', foot_width: 'regular' });
    if (product.product_type === 'apparel') append('apparel_specs', 'product_id', { product_id: id, gender: 'unisex', apparel_kind: 'shirt', material: 'Chất liệu mẫu — cập nhật theo nhà sản xuất' });
    db.product_images ||= [];
    if (!db.product_images.some(i => i.product_id === id)) append('product_images', 'id', { id: 'demo-image-' + id, product_id: id, variant_id: null, url: '/products/' + product.product_type + '.svg', sort_order: 0 });
  }
  const starts_at = '2026-01-01T00:00:00+07:00', ends_at = '2027-12-31T23:59:59+07:00';
  const base = { description: 'Voucher mẫu để thử chức năng đặt hàng và báo cáo. Có thể sửa hoặc tạm ẩn.', min_order: 500000, max_discount: 200000, usage_limit: 100, per_user_limit: 5, used_count: 0, starts_at, ends_at, is_active: true, created_by: null };
  append('vouchers', 'code', { ...base, id: 'demo-voucher-all', code: 'DEMO10', name: 'Ưu đãi mẫu 10%', discount_type: 'percent', discount_value: 10, applies_to: 'all' });
  if (db.brands?.length) {
    append('vouchers', 'code', { ...base, id: 'demo-voucher-brand', code: 'BRAND50', name: 'Giảm mẫu 50.000đ theo thương hiệu', discount_type: 'fixed', discount_value: 50000, applies_to: 'brand' });
    append('voucher_scopes', 'id', { id: 'demo-scope-brand', voucher_id: 'demo-voucher-brand', scope_type: 'brand', scope_id: db.brands[0].id });
  }
  return db;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const path = new URL('./db.json', import.meta.url);
  const db = JSON.parse(readFileSync(path, 'utf8'));
  writeFileSync(path, JSON.stringify(seedManagementCatalog(db), null, 2) + '\n');
  console.log('Đã bổ sung catalog mẫu; giữ nguyên các giao dịch hiện có.');
}
