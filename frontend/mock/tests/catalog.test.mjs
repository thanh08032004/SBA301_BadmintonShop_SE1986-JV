import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { saveCatalog } from '../actions/catalog.mjs';
import { startServer } from '../server.mjs';
const seed = () => JSON.parse(readFileSync(new URL('../db.json', import.meta.url), 'utf8'));
test('catalog saves price history with actor and rejects invalid stock', () => {
  const db = seed(),
    variant = db.product_variants[0],
    old = variant.price;
  saveCatalog(
    db,
    { table: 'product_variants', id: variant.id, record: { ...variant, price: old + 1000 } },
    'manager',
  );
  assert.equal(variant.price, old + 1000);
  assert.equal(db.product_price_history.at(-1).old_price, old);
  assert.equal(db.product_price_history.at(-1).changed_by, 'manager');
  assert.throws(
    () =>
      saveCatalog(
        db,
        {
          table: 'product_variants',
          id: variant.id,
          record: { ...variant, stock_quantity: variant.stock_quantity + 1 },
        },
        'manager',
      ),
    /Quản lý kho/,
  );
  assert.throws(() =>
    saveCatalog(
      db,
      { table: 'product_variants', id: variant.id, record: { ...variant, stock_quantity: -1 } },
      'manager',
    ),
  );
  assert.equal(variant.stock_quantity, seed().product_variants[0].stock_quantity);
});
test('catalog enforces category cycles, product type and voucher scope', () => {
  const db = seed(),
    category = db.categories[0];
  assert.throws(() =>
    saveCatalog(
      db,
      { table: 'categories', id: category.id, record: { ...category, parent_id: category.id } },
      'manager',
    ),
  );
  const shoe = db.products.find((p) => p.product_type === 'shoes');
  if (shoe)
    assert.throws(() =>
      saveCatalog(
        db,
        {
          table: 'racket_specs',
          record: {
            product_id: shoe.id,
            balance_type: 'even',
            flex: 'medium',
            play_style: 'all_round',
          },
        },
        'manager',
      ),
    );
  db.vouchers = [{ id: 'v', applies_to: 'brand' }];
  assert.throws(() =>
    saveCatalog(
      db,
      {
        table: 'voucher_scopes',
        record: { voucher_id: 'v', scope_type: 'category', scope_id: category.id },
      },
      'manager',
    ),
  );
  assert.throws(() => saveCatalog(db, { table: 'product_price_history', record: {} }, 'manager'));
});
test('HTTP catalog writes require management role', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'manager-test-'));
  const path = join(dir, 'db.json');
  writeFileSync(path, JSON.stringify(seed()));
  const server = startServer(0, path);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const base = 'http://127.0.0.1:' + server.address().port;
    const login = await fetch(base + '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'customer1@gmail.com', password: '123' }),
    });
    const { authToken } = await login.json();
    const response = await fetch(base + '/api/shop', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + authToken },
      body: JSON.stringify({
        type: 'catalog_save',
        table: 'brands',
        record: { name: 'Forbidden', slug: 'forbidden', is_active: true },
      }),
    });
    assert.equal(response.status, 403);
    const managerLogin = await fetch(base + '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'manager1@gmail.com', password: '123' }),
    });
    const manager = await managerLogin.json();
    const saved = await fetch(base + '/api/shop', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + manager.authToken },
      body: JSON.stringify({
        type: 'catalog_save',
        table: 'brands',
        record: { name: 'New brand', slug: 'new-brand', is_active: true },
      }),
    });
    assert.equal(saved.status, 200);
    const result = await saved.json();
    assert.ok(result.brands.some((b) => b.slug === 'new-brand'));
    assert.ok(JSON.parse(readFileSync(path, 'utf8')).brands.some((b) => b.slug === 'new-brand'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
});
