const check = (ok, message) => { if (!ok) throw new Error(message); };
export function calculateVoucher(data, code, items, userId, now = Date.now()) {
  if (!String(code || '').trim()) return { discount: 0, voucher: null };
  const voucher = (data.vouchers || []).find(v => v.code.toUpperCase() === String(code).trim().toUpperCase());
  check(voucher?.is_active, 'Voucher không tồn tại hoặc đã tạm ngưng.');
  check(Date.parse(voucher.starts_at) <= now && Date.parse(voucher.ends_at) >= now, 'Voucher chưa bắt đầu hoặc đã hết hạn.');
  check(voucher.usage_limit == null || voucher.used_count < voucher.usage_limit, 'Voucher đã hết lượt sử dụng.');
  const used = (data.voucher_usages || []).filter(u => u.voucher_id === voucher.id && String(u.user_id) === String(userId));
  check(used.length < voucher.per_user_limit, 'Bạn đã dùng hết lượt của voucher này.');
  const lines = items.map(i => { const v = data.product_variants.find(v => v.id === i.variant_id); return { amount: Number(v?.price || 0) * i.quantity, product: data.products.find(p => p.id === v?.product_id) }; });
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  check(subtotal >= voucher.min_order, 'Đơn hàng chưa đạt giá trị tối thiểu của voucher.');
  const scopes = (data.voucher_scopes || []).filter(s => s.voucher_id === voucher.id && s.scope_type === voucher.applies_to).map(s => String(s.scope_id));
  const eligible = lines.filter(line => voucher.applies_to === 'all' || scopes.includes(String(line.product?.[{ product: 'id', brand: 'brand_id', category: 'category_id' }[voucher.applies_to]]))).reduce((sum, line) => sum + line.amount, 0);
  check(eligible > 0, 'Giỏ hàng không có sản phẩm thuộc phạm vi voucher.');
  let discount = voucher.discount_type === 'percent' ? Math.floor(eligible * voucher.discount_value / 100) : Number(voucher.discount_value);
  if (voucher.max_discount != null) discount = Math.min(discount, voucher.max_discount);
  return { voucher, discount: Math.min(discount, eligible, subtotal) };
}
