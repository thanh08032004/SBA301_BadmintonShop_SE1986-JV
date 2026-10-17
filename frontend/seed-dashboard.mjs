import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { seedManagementCatalog } from './seed-management.mjs';

export function seedDashboard(db, asOf = new Date('2026-10-17T12:00:00+07:00')) {
  const add = (table, row) => { db[table] ||= []; if (!db[table].some(r => r.id === row.id)) db[table].push({ ...row, is_demo: true }); };
  const demos = [
    { type: 'racket', name: 'Vợt luyện tập Club 2026 (Mẫu)', price: 1650000, cost: 1100000, sizes: ['3U-G5', '4U-G5', '5U-G5'], stock: [0, 3, 24] },
    { type: 'shoes', name: 'Giày thi đấu Court Pro (Mẫu)', price: 1250000, cost: 780000, sizes: ['40', '41', '42'], stock: [4, 32, 18] },
    { type: 'apparel', name: 'Áo thể thao Air Fit (Mẫu)', price: 350000, cost: 180000, sizes: ['S', 'M', 'L'], stock: [0, 48, 65] },
  ];
  const created_at = '2026-05-01T08:00:00+07:00';
  for (const demo of demos) {
    const id = 'demo-product-' + demo.type;
    add('products', { id, name: demo.name, product_type: demo.type, category_id: db.categories.find(c => c.slug === demo.type)?.id, brand_id: db.brands[0].id, brand: db.brands[0].name, slug: id, description: 'Sản phẩm mẫu để minh họa tồn kho và báo cáo doanh thu.', base_price: demo.price, is_active: true, created_by: null, created_at, updated_at: created_at });
    demo.sizes.forEach((size, i) => add('product_variants', { id: id + '-v' + i, product_id: id, sku: 'DEMO-' + demo.type.toUpperCase() + '-' + size, barcode: null, color: ['Xanh', 'Trắng', 'Đen'][i], size, price: demo.price, cost_price: demo.cost, stock_quantity: demo.stock[i], low_stock_threshold: 5, is_active: true }));
  }
  seedManagementCatalog(db);
  const variants = db.product_variants.filter(v => v.id.startsWith('demo-product-'));
  const names = ['Nguyễn Minh Anh', 'Trần Hoàng Nam', 'Lê Thảo Vy', 'Phạm Quốc Huy', 'Võ Ngọc Linh', 'Đặng Tuấn Kiệt'];
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const month = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() - monthOffset, 1));
    const maxDay = monthOffset === 0 ? asOf.getUTCDate() : 28;
    for (let index = 0; index < 12; index++) {
      const id = `demo-order-${month.toISOString().slice(0, 7)}-${index + 1}`;
      if (db.orders.some(o => o.id === id)) continue;
      const date = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1 + Math.floor(index * (maxDay - 1) / 11), 3 + index % 8));
      const timestamp = date.toISOString();
      const status = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'pending', 'confirmed', 'preparing', 'cancelled'][index];
      const paid = status === 'completed';
      const chosen = [variants[(index + monthOffset) % variants.length], variants[(index + monthOffset + 4) % variants.length]];
      const quantities = [1 + index % 3, 1 + monthOffset % 2];
      const subtotal = chosen.reduce((sum, v, i) => sum + v.price * quantities[i], 0);
      const discount_amount = index % 4 === 0 ? Math.min(100000, Math.floor(subtotal * 0.05)) : 0;
      const shipping_fee = subtotal >= 2000000 ? 0 : 30000;
      const total_amount = subtotal - discount_amount + shipping_fee;
      add('orders', { id, order_code: 'DEMO-' + month.toISOString().slice(0, 7).replace('-', '') + '-' + String(index + 1).padStart(3, '0'), user_id: db.carts[0]?.user_id || null, channel: index % 3 === 0 ? 'in_store' : 'online', status, payment_status: paid ? 'paid' : 'unpaid', receiver_name: names[index % names.length], receiver_phone: '090000' + String(index + 1).padStart(4, '0'), shipping_address: 'Địa chỉ mẫu, Thành phố Hồ Chí Minh', voucher_id: null, voucher_code: null, subtotal, discount_amount, shipping_fee, total_amount, note: 'Giao dịch mẫu cho dashboard. Không phát sinh giao hàng thực tế; tồn kho mẫu là số dư hiện tại.', created_at: timestamp, updated_at: timestamp });
      chosen.forEach((v, i) => {
        const product = db.products.find(p => p.id === v.product_id);
        add('order_items', { id: id + '-item-' + i, order_id: id, variant_id: v.id, product_id: product.id, product_name: product.name, variant_info: v.color + ' / ' + v.size, unit_price: v.price, quantity: quantities[i], line_total: v.price * quantities[i] });
      });
      add('payments', { id: id + '-payment', order_id: id, method: index % 2 === 0 ? 'cod' : 'qr', gateway: index % 2 === 0 ? null : 'mbbank', amount: total_amount, status: paid ? 'completed' : status === 'cancelled' ? 'cancelled' : 'pending', created_at: timestamp, updated_at: timestamp });
      add('order_status_history', { id: id + '-history', order_id: id, from_status: null, to_status: status, changed_by: 'demo-seed', note: 'Trạng thái mẫu cho báo cáo dashboard.', created_at: timestamp });
    }
  }
  return db;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const path = new URL('./db.json', import.meta.url);
  const db = JSON.parse(readFileSync(path, 'utf8'));
  writeFileSync(path, JSON.stringify(seedDashboard(db), null, 2) + '\n');
  console.log('Đã thêm dữ liệu dashboard mẫu: 3 sản phẩm, 9 SKU và 72 đơn trong 6 tháng.');
}
