import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';

test('management pages render database records and actionable controls', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { renderManagement } = await server.ssrLoadModule('/verification/management-render.fixture.jsx');
    const data = JSON.parse(readFileSync(new URL('../db.json', import.meta.url), 'utf8'));
    const dashboard = renderManagement('/management', data);
    assert.ok(dashboard.includes('Dashboard tổng quan'));
    assert.ok(dashboard.includes('Xuất báo cáo'));
    assert.ok(dashboard.includes('Tổng số lượng tồn'));
    assert.ok(dashboard.includes('Chi tiết tồn kho theo sản phẩm'));
    assert.ok(dashboard.includes('Xem SKU'));
    assert.ok(dashboard.includes(data.products[0].name));
    for (const [table, title] of [['products', 'Sản phẩm'], ['brands', 'Thương hiệu'], ['vouchers', 'Voucher']]) {
      const html = renderManagement('/management/catalog/' + table, data);
      assert.ok(html.includes(title)); assert.ok(html.includes('Thêm mới')); assert.ok(html.includes('Quản lý chi tiết') || html.includes('Xem chi tiết'));
      assert.ok(html.includes('Phân trang danh sách'));
      assert.ok(!html.includes('<th>Slug</th>'));
      assert.ok(!html.includes('<th>Giới hạn mỗi khách</th>'));
    }
    // Related records stay scoped to the selected product, never to the whole table.
    const first = data.products[0], second = data.products[1];
    const info = renderManagement('/management/catalog/products?product=' + first.id + '&tab=info', data);
    assert.ok(info.includes('manager-info-card')); assert.ok(info.includes('Chỉnh sửa'));
    assert.ok(info.includes('Slug chia sẻ'));
    const delivery = renderManagement('/management/deliveries', data);
    assert.ok(delivery.includes('management-delivery')); assert.ok(delivery.includes('Vận đơn &amp; Giao hàng'));
    assert.ok(delivery.includes('href="/management/catalog/products"'));
    const support = renderManagement('/management/support-tickets', data);
    assert.ok(support.includes('manager-search')); assert.ok(support.includes('Phân trang danh sách'));
    const ticket = data.support_tickets[0];
    if (ticket) assert.ok(renderManagement('/management/support-tickets/' + ticket.id, data).includes('Cập nhật kết quả xử lý'));
    const ownVariant = data.product_variants.find(v => v.product_id === first.id);
    const otherVariant = data.product_variants.find(v => v.product_id === second.id);
    const variants = renderManagement('/management/catalog/products?product=' + first.id + '&tab=variants', data);
    assert.ok(variants.includes(ownVariant.sku)); assert.ok(!variants.includes(otherVariant.sku));
    assert.ok(variants.includes('Hình ảnh')); assert.ok(variants.includes('Thông số')); assert.ok(variants.includes('Lịch sử giá'));
    const imagesData = structuredClone(data);
    imagesData.product_images = [{ id:'own-image', product_id:first.id, url:'/products/own-image.png', sort_order:0 }, { id:'other-image', product_id:second.id, url:'/products/other-image.png', sort_order:0 }];
    const images = renderManagement('/management/catalog/products?product=' + first.id + '&tab=images', imagesData);
    assert.ok(images.includes('/products/own-image.png')); assert.ok(!images.includes('/products/other-image.png'));
    assert.ok(images.includes('Ảnh mới tự gắn vào sản phẩm này'));
    const voucher = data.vouchers.find(v => v.applies_to === 'brand');
    const voucherData = structuredClone(data);
    voucherData.voucher_usages = [{ id:'u1', voucher_id:voucher.id, order_id:'OWN-VOUCHER-ORDER', user_id:'u', discount_amount:50000, used_at:'2026-10-17' }, { id:'u2', voucher_id:'other-voucher', order_id:'OTHER-VOUCHER-ORDER', user_id:'u', discount_amount:50000, used_at:'2026-10-17' }];
    const usages = renderManagement('/management/catalog/vouchers?voucher=' + voucher.id + '&tab=usages', voucherData);
    assert.ok(usages.includes('OWN-VOUCHER-ORDER')); assert.ok(!usages.includes('OTHER-VOUCHER-ORDER'));
    assert.ok(usages.includes('Phạm vi áp dụng')); assert.ok(usages.includes('Thông tin voucher'));
    for (const table of ['product_images','product_variants','racket_specs','shoe_specs','apparel_specs','product_price_history','voucher_scopes','voucher_usages']) {
      assert.ok(!dashboard.includes('href="/management/catalog/' + table + '"'));
    }
    const orders = renderManagement('/management/orders', data);
    assert.ok(orders.includes([...data.orders].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0].order_code)); assert.ok(orders.includes('Xem &amp; xử lý'));
  } finally { await server.close(); }
});
