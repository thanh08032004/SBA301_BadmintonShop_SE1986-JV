import { createServer } from "node:http";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const dbPath = fileURLToPath(new URL("./db.json", import.meta.url));
function view(db) {
  const {
    products,
    product_variants,
    carts,
    cart_items,
    orders,
    order_items,
    payments,
    order_status_history,
    support_tickets,
    ticket_items,
  } = db;
  return {
    products,
    product_variants,
    carts,
    cart_items,
    orders,
    order_items,
    payments,
    order_status_history,
    support_tickets,
    ticket_items,
  };
}
function check(condition, message) {
  if (!condition) throw new Error(message);
}
export function mutate(db, action) {
  const now = new Date().toISOString();
  const cart = db.carts[0];
  const variant = (id) =>
    db.product_variants.find((v) => v.id === id && v.is_active);
  if (action.type === "add") {
    const v = variant(action.variant_id);
    check(v, "Không tìm thấy biến thể sản phẩm.");
    const item = db.cart_items.find((i) => i.variant_id === v.id);
    check(
      (item?.quantity || 0) + 1 <= v.stock_quantity,
      "Số lượng vượt quá tồn kho.",
    );
    if (item) {
      item.quantity++;
      item.is_selected = true;
    } else
      db.cart_items.push({
        id: randomUUID(),
        cart_id: cart.id,
        variant_id: v.id,
        quantity: 1,
        is_selected: true,
        added_at: now,
      });
  } else if (action.type === "update" || action.type === "remove") {
    const item = db.cart_items.find((i) => i.id === action.id);
    check(item, "Sản phẩm không còn trong giỏ.");
    if (action.type === "remove")
      db.cart_items = db.cart_items.filter((i) => i.id !== item.id);
    else {
      if (action.quantity !== undefined) {
        check(
          Number.isInteger(action.quantity) &&
            action.quantity > 0 &&
            action.quantity <= variant(item.variant_id).stock_quantity,
          "Số lượng không hợp lệ hoặc vượt quá tồn kho.",
        );
        item.quantity = action.quantity;
      }
      if (typeof action.is_selected === "boolean")
        item.is_selected = action.is_selected;
    }
  } else if (action.type === "select_all") {
    check(typeof action.selected === "boolean", "Lựa chọn không hợp lệ.");
    db.cart_items.forEach((i) => {
      i.is_selected = action.selected;
    });
  } else if (action.type === "checkout") {
    const receiver_name = String(action.receiver_name || "").trim();
    const receiver_phone = String(action.receiver_phone || "").trim();
    const shipping_address = String(action.shipping_address || "").trim();
    const note = String(action.note || "").trim();
    check(
      receiver_name.length > 0 && receiver_name.length <= 150,
      "Vui lòng nhập tên người nhận (tối đa 150 ký tự).",
    );
    check(
      /^(0|\+84)[0-9]{9}$/.test(receiver_phone),
      "Số điện thoại không hợp lệ.",
    );
    check(
      shipping_address.length >= 10 && shipping_address.length <= 500,
      "Địa chỉ cần từ 10 đến 500 ký tự.",
    );
    check(note.length <= 500, "Ghi chú tối đa 500 ký tự.");
    const direct = action.source === "direct";
    check(
      direct || action.source === "cart",
      "Vui lòng đặt hàng từ sản phẩm hoặc giỏ hàng.",
    );
    const paymentMethod = action.payment_method || "cod";
    check(
      ["cod", "prepaid"].includes(paymentMethod),
      "Phương thức thanh toán không hợp lệ.",
    );
    const gateway =
      paymentMethod === "prepaid" ? action.gateway || "mbbank" : null;
    check(
      !gateway || ["mbbank", "momo", "card"].includes(gateway),
      "Phương thức trả trước không hợp lệ.",
    );
    const selectedIds = action.cart_item_ids;
    if (!direct && selectedIds !== undefined) {
      check(
        Array.isArray(selectedIds) &&
          selectedIds.length > 0 &&
          new Set(selectedIds).size === selectedIds.length,
        "Chọn ít nhất một sản phẩm để đặt hàng.",
      );
      check(
        selectedIds.every((id) =>
          db.cart_items.some((i) => i.id === id && i.cart_id === cart.id),
        ),
        "Sản phẩm đã thay đổi trong giỏ. Vui lòng chọn lại.",
      );
    }
    const items = direct
      ? [{ variant_id: action.variant_id, quantity: action.quantity }]
      : db.cart_items.filter((i) =>
          selectedIds ? selectedIds.includes(i.id) : i.is_selected,
        );
    for (const i of items)
      check(
        Number.isInteger(i.quantity) && i.quantity > 0,
        "Số lượng không hợp lệ.",
      );
    check(items.length, "Chọn ít nhất một sản phẩm để đặt hàng.");
    for (const i of items)
      check(
        variant(i.variant_id) &&
          i.quantity <= variant(i.variant_id).stock_quantity,
        "Sản phẩm đã hết hoặc không đủ tồn kho.",
      );
    const subtotal = items.reduce(
      (s, i) => s + variant(i.variant_id).price * i.quantity,
      0,
    );
    const shipping_fee = subtotal >= 2000000 ? 0 : 30000;
    const id = randomUUID();
    const order = {
      id,
      order_code: "BS-" + Date.now() + "-" + id.slice(0, 4),
      user_id: cart.user_id,
      channel: "online",
      status: "pending",
      payment_status: "unpaid",
      receiver_name,
      receiver_phone,
      shipping_address,
      voucher_id: null,
      voucher_code: null,
      subtotal,
      discount_amount: 0,
      shipping_fee,
      total_amount: subtotal + shipping_fee,
      note,
      created_at: now,
      updated_at: now,
    };
    db.orders.push(order);
    for (const i of items) {
      const v = variant(i.variant_id),
        p = db.products.find((p) => p.id === v.product_id);
      db.order_items.push({
        id: randomUUID(),
        order_id: id,
        variant_id: v.id,
        product_id: p.id,
        product_name: p.name,
        variant_info: v.color + " / " + v.size,
        unit_price: v.price,
        quantity: i.quantity,
        line_total: v.price * i.quantity,
      });
      v.stock_quantity -= i.quantity;
    }
    db.payments.push({
      id: randomUUID(),
      order_id: id,
      method:
        paymentMethod === "prepaid"
          ? gateway === "momo"
            ? "ewallet"
            : gateway === "card"
              ? "card"
              : "qr"
          : "cod",
      gateway,
      status: "pending",
      amount: order.total_amount,
      created_at: now,
      updated_at: now,
    });
    db.order_status_history.push({
      id: randomUUID(),
      order_id: id,
      from_status: null,
      to_status: "pending",
      changed_by: cart.user_id,
      note: "Khách hàng đặt hàng",
      created_at: now,
    });
    if (!direct)
      db.cart_items = db.cart_items.filter(
        (i) => !items.some((selected) => selected.id === i.id),
      );
  } else if (action.type === "create_support_ticket") {
    const order = db.orders.find((item) => item.id === action.order_id);
    const ticketType = String(action.ticket_type || "");
    const reason = String(action.reason || "").trim();
    const description = String(action.description || "").trim();
    check(order, "Không tìm thấy đơn hàng.");
    check(
      ["return", "exchange", "warranty", "complaint"].includes(ticketType),
      "Loại phiếu hỗ trợ không hợp lệ.",
    );
    check(
      reason.length > 0 && reason.length <= 300,
      "Lý do phiếu hỗ trợ là bắt buộc và tối đa 300 ký tự.",
    );
    check(
      description.length <= 5000,
      "Mô tả phiếu hỗ trợ tối đa 5000 ký tự.",
    );
    check(
      Array.isArray(db.support_tickets),
      "Dữ liệu phiếu hỗ trợ không hợp lệ.",
    );
    const id = randomUUID();
    db.support_tickets.push({
      id,
      ticket_code: "ST-" + Date.now() + "-" + id.slice(0, 4),
      user_id: order.user_id,
      order_id: order.id,
      ticket_type: ticketType,
      status: "open",
      reason,
      description,
      resolution_type: null,
      proposed_resolution: null,
      proposed_refund_amount: null,
      handled_by: null,
      reviewed_at: null,
      resolved_at: null,
      created_at: now,
      updated_at: now,
    });
  } else if (action.type === "update_support_ticket") {
    const ticket = db.support_tickets.find(
      (item) => item.id === action.ticket_id,
    );
    const status = String(action.status || "");
    const resolutionType = action.resolution_type ?? null;
    const proposedResolution = String(action.proposed_resolution || "").trim();
    const handledBy = String(action.handled_by || "").trim();
    const refundAmount = action.proposed_refund_amount ?? null;
    check(ticket, "Không tìm thấy phiếu hỗ trợ.");
    check(
      ["under_review", "approved", "rejected", "resolved", "cancelled"].includes(
        status,
      ),
      "Trạng thái xử lý phiếu hỗ trợ không hợp lệ.",
    );
    check(
      resolutionType === null ||
        ["refund", "exchange", "repair", "none"].includes(resolutionType),
      "Hướng xử lý phiếu hỗ trợ không hợp lệ.",
    );
    check(
      proposedResolution.length <= 5000,
      "Phản hồi phiếu hỗ trợ tối đa 5000 ký tự.",
    );
    check(
      !["approved", "rejected", "resolved"].includes(status) ||
        proposedResolution.length > 0,
      "Vui lòng nhập phản hồi trước khi chốt kết quả xử lý.",
    );
    check(
      refundAmount === null ||
        (typeof refundAmount === "number" &&
          Number.isFinite(refundAmount) &&
          refundAmount >= 0),
      "Số tiền hoàn dự kiến không hợp lệ.",
    );
    check(
      handledBy.length <= 200,
      "Thông tin nhân viên xử lý không hợp lệ.",
    );
    ticket.status = status;
    ticket.resolution_type = resolutionType;
    ticket.proposed_resolution = proposedResolution || null;
    ticket.proposed_refund_amount =
      resolutionType === "refund" ? refundAmount : null;
    ticket.handled_by = handledBy || ticket.handled_by || null;
    ticket.reviewed_at = ticket.reviewed_at || now;
    ticket.resolved_at = status === "resolved" ? now : null;
    ticket.updated_at = now;
  } else if (action.type === "start_payment") {
    const order = db.orders.find((o) => o.id === action.order_id);
    check(
      order &&
        order.status !== "cancelled" &&
        order.payment_status === "unpaid",
      "Đơn hàng không thể thanh toán.",
    );
    const payment = db.payments.find((p) => p.order_id === order.id);
    check(
      payment && payment.method !== "cod",
      "Đơn hàng này thanh toán khi nhận hàng.",
    );
    check(
      ["mbbank", "momo", "card"].includes(action.gateway),
      "Phương thức trả trước không hợp lệ.",
    );
    payment.method =
      action.gateway === "momo"
        ? "ewallet"
        : action.gateway === "card"
          ? "card"
          : "qr";
    payment.gateway = action.gateway;
    payment.updated_at = now;
  } else throw new Error("Thao tác không hợp lệ.");
  cart.updated_at = now;
  return db;
}
export function startServer(port = 3000, databasePath = dbPath) {
  const sessions = new Map();
  const server = createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    if (req.url !== "/api/shop" && req.url !== "/api/auth/login") {
      res.writeHead(404);
      res.end(JSON.stringify({ message: "Không tìm thấy API." }));
      return;
    }
    try {
      if (req.method !== "GET" && req.method !== "POST") {
        res.writeHead(405);
        res.end("{}");
        return;
      }
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        check(body.length < 10000, "Yêu cầu quá lớn.");
      }
      // Read after receiving the body; synchronous mutation and rename keep each write together.
      const db = JSON.parse(readFileSync(databasePath, "utf8"));
      if (req.url === "/api/auth/login") {
        if (req.method !== "POST") {
          res.writeHead(405);
          res.end(JSON.stringify({ message: "Yêu cầu POST." }));
          return;
        }
        const credentials = JSON.parse(body);
        const email =
          typeof credentials.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const user = db.users.find(
          (user) =>
            user.email.toLowerCase() === email &&
            typeof credentials.password === "string" &&
            user.password === credentials.password,
        );
        if (!user) {
          res.writeHead(401);
          res.end(
            JSON.stringify({ message: "Email hoặc mật khẩu không đúng." }),
          );
          return;
        }
        res.setHeader("Cache-Control", "no-store");
        const authToken = "mock-" + randomUUID();
        sessions.set(authToken, user.email);
        res.end(
          JSON.stringify({
            id: user.id || user.email,
            email: user.email,
            fullName: user.fullName,
            roles: user.roles,
            authToken,
          }),
        );
        return;
      }
      const token = req.headers.authorization?.replace(/^Bearer /, "");
      const authenticated = sessions.has(token);
      if (
        (token && !authenticated) ||
        (req.method === "POST" && !authenticated)
      ) {
        res.writeHead(401);
        res.end(
          JSON.stringify({
            message: "Vui lòng đăng nhập để sử dụng chức năng này.",
          }),
        );
        return;
      }
      if (req.method === "GET" && !authenticated) {
        res.end(
          JSON.stringify({
            products: db.products,
            product_variants: db.product_variants,
            carts: [],
            cart_items: [],
            orders: [],
            order_items: [],
            payments: [],
            order_status_history: [],
            support_tickets: [],
            ticket_items: [],
          }),
        );
        return;
      }
      if (req.method === "POST") {
        const action = JSON.parse(body);
        if (action.type === "update_support_ticket") {
          const email = sessions.get(token);
          const actor = db.users.find((user) => user.email === email);
          if (
            !actor?.roles?.some((role) =>
              ["MANAGER", "STAFF"].includes(role.toUpperCase()),
            )
          ) {
            res.writeHead(403);
            res.end(
              JSON.stringify({
                message: "Bạn không có quyền xử lý phiếu hỗ trợ.",
              }),
            );
            return;
          }
        }
        mutate(db, action);
        writeFileSync(databasePath + ".tmp", JSON.stringify(db, null, 2) + "\n");
        renameSync(databasePath + ".tmp", databasePath);
      }
      res.end(JSON.stringify(view(db)));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ message: error.message }));
    }
  });
  server.listen(port, "127.0.0.1", () =>
    console.log(
      "Mock API: http://127.0.0.1:" + server.address().port + "/api/shop",
    ),
  );
  return server;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  startServer(Number(process.env.PORT || 3000));
