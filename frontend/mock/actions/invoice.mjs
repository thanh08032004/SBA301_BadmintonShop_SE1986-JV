import { randomUUID } from 'node:crypto';

const check = (condition, message) => {
  if (!condition) throw new Error(message);
};
const text = (value, maxLength, label, required = false) => {
  const result = String(value ?? '').trim();
  check(!required || result.length > 0, `Vui lòng nhập ${label}.`);
  check(result.length <= maxLength, `${label} tối đa ${maxLength} ký tự.`);
  return result || null;
};
const id = () => randomUUID();
const invoiceNo = () =>
  `INV-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${id().slice(0, 6).toUpperCase()}`;

function createSaleInvoice(db, action, issuedBy, now, parent = null) {
  const order = db.orders.find((item) => String(item.id) === String(action.order_id));
  check(order, 'Không tìm thấy đơn hàng.');
  check(
    order.status === 'completed' && order.payment_status === 'paid',
    'Chỉ tạo hóa đơn cho đơn đã hoàn tất và thanh toán.',
  );
  check(
    !db.invoices.some(
      (item) =>
        String(item.id) !== String(parent?.id) &&
        String(item.order_id) === String(order.id) &&
        item.invoice_type === 'sale' &&
        item.status === 'issued',
    ),
    'Đơn hàng đã có hóa đơn bán còn hiệu lực.',
  );
  const sourceItems = db.order_items.filter((item) => String(item.order_id) === String(order.id));
  check(sourceItems.length > 0, 'Đơn hàng không có sản phẩm để lập hóa đơn.');
  const invoiceId = id();
  const invoice = {
    id: invoiceId,
    invoice_no: invoiceNo(),
    order_id: order.id,
    invoice_type: 'sale',
    parent_invoice_id: parent?.id ?? null,
    status: 'issued',
    buyer_name: text(action.buyer_name || order.receiver_name, 150, 'tên người mua', true),
    buyer_email: text(action.buyer_email, 190, 'email người mua'),
    buyer_address: text(action.buyer_address || order.shipping_address, 500, 'địa chỉ người mua'),
    buyer_tax_code: text(action.buyer_tax_code, 30, 'mã số thuế'),
    subtotal: Number(order.subtotal),
    discount_amount: Number(order.discount_amount || 0),
    shipping_fee: Number(order.shipping_fee || 0),
    total_amount: Number(order.total_amount),
    reason: null,
    pdf_url: null,
    issued_by: issuedBy ?? null,
    issued_at: now,
  };
  check(
    [invoice.subtotal, invoice.discount_amount, invoice.shipping_fee, invoice.total_amount].every(
      Number.isFinite,
    ),
    'Thông tin tổng tiền đơn hàng không hợp lệ.',
  );
  const items = sourceItems.map((item) => ({
    id: id(),
    invoice_id: invoiceId,
    description: [item.product_name, item.variant_info].filter(Boolean).join(' - ').slice(0, 255),
    unit_price: Number(item.unit_price),
    quantity: Number(item.quantity),
    line_total: Number(item.line_total),
  }));
  check(
    items.every(
      (item) =>
        Number.isFinite(item.unit_price) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        Number.isFinite(item.line_total),
    ),
    'Chi tiết sản phẩm trong đơn hàng không hợp lệ.',
  );
  db.invoices.push(invoice);
  db.invoice_items.push(...items);
  return invoice;
}

export function manageInvoice(db, action, issuedBy = null) {
  db.invoices ||= [];
  db.invoice_items ||= [];
  db.invoice_deliveries ||= [];
  const now = new Date().toISOString();

  const invoice = db.invoices.find((item) => String(item.id) === String(action.invoice_id));
  check(invoice, 'Không tìm thấy hóa đơn.');

  if (action.type === 'invoice_cancel') {
    check(invoice.status === 'issued', 'Chỉ hủy được hóa đơn đang phát hành.');
    invoice.status = 'cancelled';
  } else if (action.type === 'invoice_replace') {
    check(invoice.status === 'issued', 'Chỉ thay thế được hóa đơn đang phát hành.');
    check(invoice.invoice_type === 'sale', 'Chỉ thay thế được hóa đơn bán.');
    invoice.status = 'replaced';
    createSaleInvoice(
      db,
      {
        order_id: invoice.order_id,
        buyer_name: invoice.buyer_name,
        buyer_email: invoice.buyer_email,
        buyer_address: invoice.buyer_address,
        buyer_tax_code: invoice.buyer_tax_code,
      },
      issuedBy,
      now,
      invoice,
    );
  } else if (action.type === 'invoice_adjust') {
    check(invoice.status === 'issued', 'Chỉ điều chỉnh được hóa đơn đang phát hành.');
    check(invoice.invoice_type === 'sale', 'Chỉ điều chỉnh được hóa đơn bán.');
    const amount = Number(action.amount);
    check(
      Number.isSafeInteger(amount) && amount !== 0,
      'Số tiền điều chỉnh phải là số nguyên khác 0.',
    );
    const reason = text(action.reason, 300, 'lý do điều chỉnh', true);
    const adjustmentId = id();
    const itemDescription = text(action.description || reason, 255, 'diễn giải', true);
    db.invoices.push({
      id: adjustmentId,
      invoice_no: invoiceNo(),
      order_id: invoice.order_id,
      invoice_type: 'adjustment',
      parent_invoice_id: invoice.id,
      status: 'issued',
      buyer_name: invoice.buyer_name,
      buyer_email: invoice.buyer_email,
      buyer_address: invoice.buyer_address,
      buyer_tax_code: invoice.buyer_tax_code,
      subtotal: amount,
      discount_amount: 0,
      shipping_fee: 0,
      total_amount: amount,
      reason,
      pdf_url: null,
      issued_by: issuedBy ?? null,
      issued_at: now,
    });
    db.invoice_items.push({
      id: id(),
      invoice_id: adjustmentId,
      description: itemDescription,
      unit_price: Math.abs(amount),
      quantity: 1,
      line_total: amount,
    });
  } else if (action.type === 'invoice_delivery') {
    check(invoice.status === 'issued', 'Chỉ gửi hoặc tải được hóa đơn đang phát hành.');
    const channel = action.channel;
    check(['email', 'download'].includes(channel), 'Kênh gửi hóa đơn không hợp lệ.');
    const recipient =
      channel === 'email' ? text(action.recipient, 190, 'email nhận hóa đơn', true) : null;
    if (channel === 'email') {
      check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient), 'Email nhận hóa đơn không hợp lệ.');
    }
    db.invoice_deliveries.push({
      id: id(),
      invoice_id: invoice.id,
      channel,
      recipient,
      status: channel === 'email' ? 'queued' : 'sent',
      sent_at: channel === 'download' ? now : null,
    });
  } else {
    throw new Error('Thao tác hóa đơn không hợp lệ.');
  }
}

export function syncCompletedOrderInvoices(db) {
  db.invoices ||= [];
  db.invoice_items ||= [];
  db.invoice_deliveries ||= [];
  let created = false;
  const now = new Date().toISOString();
  for (const order of db.orders || []) {
    if (
      order.status !== 'completed' ||
      order.payment_status !== 'paid' ||
      db.invoices.some(
        (invoice) =>
          String(invoice.order_id) === String(order.id) && invoice.invoice_type === 'sale',
      )
    ) {
      continue;
    }
    createSaleInvoice(
      db,
      {
        order_id: order.id,
        buyer_name: order.receiver_name,
        buyer_address: order.shipping_address,
      },
      null,
      now,
    );
    created = true;
  }
  return created;
}
