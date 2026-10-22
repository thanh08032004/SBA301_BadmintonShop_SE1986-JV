import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { updateManagedOrder, deleteCatalog } from '../actions/management.mjs';
import { catalogs } from '../../src/modules/management/constants.js';
import { buildReport } from '../../src/modules/management/utils/reportData.js';
import { calculateVoucher } from '../../src/modules/shop/utils/voucherRules.js';
import { mutate, startServer } from '../server.mjs';
const seed = () => JSON.parse(readFileSync(new URL('../db.json', import.meta.url), 'utf8'));
function orderFixture() {
  const db = seed();
  db.deliveries = [];
  db.orders = [];
  db.order_items = [];
  db.order_status_history = [];
  db.payments = [];
  db.voucher_usages = [];
  const variant = db.product_variants.find((v) => v.stock_quantity >= 2);
  mutate(db, {
    type: 'checkout',
    source: 'direct',
    variant_id: variant.id,
    quantity: 1,
    receiver_name: 'Test',
    receiver_phone: '0901234567',
    shipping_address: '12 Nguyen Trai, HCM',
  });
  return db;
}
function update(db, status, payment = db.orders[0].payment_status, note = '') {
  const order = db.orders[0];
  updateManagedOrder(
    db,
    {
      id: order.id,
      expected_status: order.status,
      expected_payment_status: order.payment_status,
      status,
      payment_status: payment,
      note,
    },
    'manager-test',
  );
}
test('confirm and prepare order; cancel restores reserved stock once and records actor', () => {
  const db = orderFixture(),
    variant = db.product_variants.find((v) => v.id === db.order_items[0].variant_id),
    stock = variant.stock_quantity;
  update(db, 'confirmed');
  assert.equal(db.orders[0].confirmed_by, 'manager-test');
  update(db, 'preparing');
  update(db, 'cancelled', 'unpaid', 'Khach yeu cau huy');
  assert.equal(variant.stock_quantity, stock + 1);
  assert.equal(db.orders[0].cancel_reason, 'Khach yeu cau huy');
  assert.equal(db.order_status_history.at(-1).changed_by, 'manager-test');
  assert.throws(() => update(db, 'cancelled', 'unpaid', 'Again'));
  assert.equal(variant.stock_quantity, stock + 1);
});
test('reject stale edits, skipped statuses and active-shipment cancellation without changes', () => {
  const db = orderFixture(),
    before = structuredClone(db);
  assert.throws(() => update(db, 'completed'));
  assert.deepEqual(db, before);
  assert.throws(() =>
    updateManagedOrder(
      db,
      {
        id: db.orders[0].id,
        expected_status: 'confirmed',
        expected_payment_status: 'unpaid',
        status: 'preparing',
      },
      'manager',
    ),
  );
  db.deliveries.push({ order_id: db.orders[0].id, status: 'pending_pickup' });
  assert.throws(() => update(db, 'cancelled', 'unpaid', 'test'));
  assert.equal(db.orders[0].status, 'pending');
});
test('record payment and return/refund updates reporting and payment records', () => {
  const db = orderFixture();
  update(db, 'confirmed', 'paid');
  assert.equal(db.payments[0].status, 'completed');
  db.orders[0].status = 'completed';
  assert.equal(buildReport(db).revenue, db.orders[0].total_amount);
  update(db, 'returned', 'refunded', 'Nhan hang tra lai');
  assert.equal(db.payments[0].status, 'refunded');
  assert.equal(buildReport(db).revenue, 0);
});
test('delete protects order references and cascades unused catalog records only', () => {
  const db = orderFixture();
  const productId = db.order_items[0].product_id;
  assert.throws(() => deleteCatalog(db, { table: 'products', id: productId }, catalogs));
  db.products.push({ id: 'unused', name: 'Unused' });
  db.product_variants.push({ id: 'unused-v', product_id: 'unused' });
  db.product_images.push({ id: 'unused-i', product_id: 'unused' });
  deleteCatalog(db, { table: 'products', id: 'unused' }, catalogs);
  assert.ok(!db.products.some((p) => p.id === 'unused'));
  assert.ok(!db.product_variants.some((p) => p.product_id === 'unused'));
  assert.ok(!db.product_images.some((p) => p.product_id === 'unused'));
});
test('checkout applies percentage/cap, persists voucher usage and enforces per-user limit', () => {
  const db = orderFixture(),
    variant = db.product_variants.find((v) => v.stock_quantity > 1);
  db.vouchers = [
    {
      id: 'test-v',
      code: 'TEST10',
      is_active: true,
      starts_at: '2000-01-01',
      ends_at: '2099-01-01',
      used_count: 0,
      usage_limit: 5,
      per_user_limit: 1,
      min_order: 0,
      discount_type: 'percent',
      discount_value: 10,
      max_discount: 50000,
      applies_to: 'all',
    },
  ];
  const action = {
    type: 'checkout',
    source: 'direct',
    variant_id: variant.id,
    quantity: 1,
    receiver_name: 'Test',
    receiver_phone: '0901234567',
    shipping_address: '12 Nguyen Trai, HCM',
    voucher_code: 'test10',
  };
  mutate(db, action);
  const order = db.orders.at(-1);
  assert.equal(order.discount_amount, Math.min(variant.price * 0.1, 50000));
  assert.equal(order.total_amount, order.subtotal - order.discount_amount + order.shipping_fee);
  assert.equal(db.voucher_usages.at(-1).order_id, order.id);
  assert.equal(db.vouchers[0].used_count, 1);
  const before = structuredClone(db);
  assert.throws(() => mutate(db, action));
  assert.deepEqual(db, before);
});
test('voucher scope excludes unmatched products, caps fixed discount at eligible subtotal', () => {
  const db = orderFixture(),
    variant = db.product_variants[0];
  db.vouchers = [
    {
      id: 'v',
      code: 'SCOPE',
      is_active: true,
      starts_at: '2000-01-01',
      ends_at: '2099-01-01',
      used_count: 0,
      per_user_limit: 2,
      min_order: 0,
      discount_type: 'fixed',
      discount_value: 99999999,
      applies_to: 'product',
    },
  ];
  db.voucher_scopes = [{ voucher_id: 'v', scope_type: 'product', scope_id: variant.product_id }];
  const item = { variant_id: variant.id, quantity: 1 };
  assert.equal(calculateVoucher(db, 'SCOPE', [item], 'u').discount, variant.price);
  db.voucher_scopes[0].scope_id = 'non-existing';
  assert.throws(() => calculateVoucher(db, 'SCOPE', [item], 'u'));
});
test('report excludes cancellations/refunds and groups amounts using Vietnam dates', () => {
  const data = {
    orders: [
      {
        id: 'a',
        created_at: '2026-09-30T18:00:00Z',
        status: 'completed',
        payment_status: 'paid',
        total_amount: 100,
        subtotal: 90,
        shipping_fee: 20,
        discount_amount: 10,
      },
      {
        id: 'b',
        created_at: '2026-10-01T00:00:00Z',
        status: 'cancelled',
        payment_status: 'paid',
        total_amount: 200,
      },
      {
        id: 'c',
        created_at: '2026-10-02T00:00:00Z',
        status: 'completed',
        payment_status: 'refunded',
        total_amount: 300,
      },
    ],
    order_items: [
      { order_id: 'a', product_id: 'p', product_name: 'P', quantity: 2, line_total: 90 },
    ],
  };
  const report = buildReport(data, '2026-10-01', '2026-10-01');
  assert.equal(report.revenue, 100);
  assert.equal(report.orders.length, 2);
  assert.equal(report.months[0].month, '2026-10');
  assert.equal(report.topProducts[0].quantity, 2);
});
test('HTTP management actions reject customers, persist updates and reload catalog', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'management-actions-')),
    path = join(dir, 'db.json');
  writeFileSync(path, JSON.stringify(orderFixture()));
  const server = startServer(0, path);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const login = async (email) =>
    (
      await (
        await fetch(base + '/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password: '123' }),
        })
      ).json()
    ).authToken;
  try {
    const customer = await login('customer1@gmail.com');
    for (const type of ['catalog_delete', 'manager_update_order']) {
      const res = await fetch(base + '/api/shop', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + customer },
        body: JSON.stringify({ type }),
      });
      assert.equal(res.status, 403);
    }
    const manager = await login('manager1@gmail.com');
    const db = JSON.parse(readFileSync(path, 'utf8')),
      order = db.orders[0];
    const res = await fetch(base + '/api/shop', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + manager },
      body: JSON.stringify({
        type: 'manager_update_order',
        id: order.id,
        expected_status: order.status,
        expected_payment_status: order.payment_status,
        status: 'confirmed',
      }),
    });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).orders[0].status, 'confirmed');
    assert.equal(
      JSON.parse(readFileSync(path, 'utf8')).orders[0].confirmed_by,
      'manager1@gmail.com',
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
});
