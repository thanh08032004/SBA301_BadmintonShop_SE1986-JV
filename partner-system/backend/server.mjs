import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8081;
const TRACKING_PORTAL_URL = process.env.TRACKING_PORTAL_URL || "http://localhost:8082/track";
const SHOP_WEBHOOK_URL = process.env.SHOP_WEBHOOK_URL || "http://localhost:8080/api/deliveries/webhook";
const DB_PATH = path.join(__dirname, "partner-db.json");

let db = { shipments: [] };

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      db = JSON.parse(data);
      if (!Array.isArray(db.shipments)) db.shipments = [];
    }
  } catch (err) {
    console.error("[FastShip BE] Lỗi tải partner-db.json:", err.message);
    db = { shipments: [] };
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("[FastShip BE] Lỗi lưu partner-db.json:", err.message);
  }
}

loadDb();

async function triggerWebhook(shipment, eventType = "status_updated") {
  const targetUrl = shipment.webhook_url || SHOP_WEBHOOK_URL;
  const payload = {
    event: eventType,
    carrier: "fastship",
    tracking_code: shipment.tracking_code,
    order_code: shipment.order_code,
    shop_order_id: shipment.shop_order_id,
    status: shipment.status,
    status_text: shipment.status_text,
    cod_amount: shipment.cod_amount,
    shipper_name: shipment.shipper_name,
    shipper_phone: shipment.shipper_phone,
    shipped_at: shipment.shipped_at,
    delivered_at: shipment.delivered_at,
    latest_event: shipment.events?.[0] || null,
    timestamp: new Date().toISOString()
  };

  try {
    console.log(`[FastShip Webhook] Gửi webhook tới ${targetUrl}...`);
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Partner-Carrier": "FastShip-Express",
        "X-Partner-Signature": "sig_" + Buffer.from(shipment.tracking_code).toString("base64")
      },
      body: JSON.stringify(payload)
    });
    console.log(`[FastShip Webhook] Phản hồi từ Shop: HTTP ${res.status}`);
    return { ok: res.ok, status: res.status, statusText: res.statusText };
  } catch (err) {
    console.warn(`[FastShip Webhook] Chưa thể kết nối Shop BE tại ${targetUrl} (${err.message}).`);
    return { ok: false, error: err.message };
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Partner-Token"
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Partner-Token"
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // 1. GET /api/v1/shipments
    if (pathname === "/api/v1/shipments" && req.method === "GET") {
      return sendJson(res, 200, {
        success: true,
        total: db.shipments.length,
        data: db.shipments
      });
    }

    // 2. GET /api/v1/shipments/track/:code
    const trackMatch = pathname.match(/^\/api\/v1\/shipments\/track\/([^/]+)$/);
    if (trackMatch && req.method === "GET") {
      const code = decodeURIComponent(trackMatch[1]);
      const shipment = db.shipments.find(
        (s) => s.tracking_code.toLowerCase() === code.toLowerCase()
      );
      if (!shipment) {
        return sendJson(res, 404, {
          success: false,
          message: `Không tìm thấy bưu phẩm có mã vận đơn '${code}'.`
        });
      }
      return sendJson(res, 200, { success: true, data: shipment });
    }

    // 3. POST /api/v1/shipments/create (Badminton Shop BE gọi để tạo vận đơn)
    if (pathname === "/api/v1/shipments/create" && req.method === "POST") {
      const body = await parseBody(req);
      if (!body.receiver_name || !body.receiver_phone || !body.shipping_address) {
        return sendJson(res, 400, {
          success: false,
          message: "Thiếu thông tin người nhận hoặc địa chỉ giao hàng."
        });
      }

      const now = new Date().toISOString();
      const codeSuffix = Math.floor(100000 + Math.random() * 900000);
      const trackingCode = `FS-${codeSuffix}`;
      const serviceType = body.service_type || "standard";
      const fee = serviceType === "express" ? 60000 : serviceType === "fast" ? 45000 : 30000;
      const days = serviceType === "express" ? 1 : serviceType === "fast" ? 2 : 3;
      const estDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      const newShipment = {
        tracking_code: trackingCode,
        shop_order_id: body.shop_order_id || body.order_id || null,
        order_code: body.order_code || null,
        service_type: serviceType,
        service_name: serviceType === "express" ? "FastShip Hỏa Tốc" : serviceType === "fast" ? "FastShip Giao Nhanh" : "FastShip Tiêu Chuẩn",
        shipping_fee: body.shipping_fee || fee,
        cod_amount: Number(body.cod_amount) || 0,
        status: "pending_pickup",
        status_text: "Đã tạo vận đơn trên FastShip Express - Chờ bưu tá đến lấy",
        receiver_name: body.receiver_name,
        receiver_phone: body.receiver_phone,
        shipping_address: body.shipping_address,
        package_desc: body.package_desc || "Dụng cụ cầu lông",
        package_weight_gram: body.package_weight_gram || 500,
        shipper_name: "Nguyễn Văn Tuấn (FastShip)",
        shipper_phone: "0987.654.321",
        shipper_license: "29-B1 999.88",
        estimated_delivery_date: estDate,
        created_at: now,
        shipped_at: null,
        delivered_at: null,
        webhook_url: body.webhook_url || SHOP_WEBHOOK_URL,
        events: [
          {
            id: "evt-" + randomUUID().slice(0, 8),
            status: "pending_pickup",
            title: "Tạo vận đơn thành công",
            location: "Cổng API FastShip Express",
            description: `Shop đã đẩy đơn sang FastShip và được cấp mã vận đơn ${trackingCode}. Đang điều phối bưu tá lấy hàng.`,
            occurred_at: now
          }
        ]
      };

      db.shipments.unshift(newShipment);
      saveDb();

      return sendJson(res, 201, {
        success: true,
        message: "Tạo vận đơn FastShip thành công.",
        data: {
          tracking_code: trackingCode,
          tracking_url: `${TRACKING_PORTAL_URL}?code=${trackingCode}`,
          carrier: "fastship",
          service_type: serviceType,
          shipping_fee: fee,
          estimated_delivery_date: estDate,
          status: newShipment.status,
          status_text: newShipment.status_text
        }
      });
    }

    // 4. POST /api/v1/shipments/calculate-fee
    if (pathname === "/api/v1/shipments/calculate-fee" && req.method === "POST") {
      const body = await parseBody(req);
      const serviceType = body.service_type || "standard";
      const base = serviceType === "express" ? 60000 : serviceType === "fast" ? 45000 : 30000;
      const weight = Number(body.weight_gram) || 500;
      const extraWeightFee = weight > 1000 ? Math.ceil((weight - 1000) / 500) * 5000 : 0;
      const totalFee = base + extraWeightFee;
      const days = serviceType === "express" ? 1 : serviceType === "fast" ? 2 : 3;

      return sendJson(res, 200, {
        success: true,
        data: {
          shipping_fee: totalFee,
          service_type: serviceType,
          estimated_delivery_days: days,
          currency: "VND"
        }
      });
    }

    // 5. POST /api/v1/shipments/:code/advance-status
    const advanceMatch = pathname.match(/^\/api\/v1\/shipments\/([^/]+)\/advance-status$/);
    if (advanceMatch && req.method === "POST") {
      const code = decodeURIComponent(advanceMatch[1]);
      const body = await parseBody(req);
      const targetStatus = body.status;
      const note = body.note || "";
      const now = new Date().toISOString();

      const shipment = db.shipments.find(
        (s) => s.tracking_code.toLowerCase() === code.toLowerCase()
      );
      if (!shipment) {
        return sendJson(res, 404, { success: false, message: "Không tìm thấy vận đơn." });
      }

      shipment.status = targetStatus;
      let eventTitle = "Cập nhật hành trình";
      let eventLocation = "Bưu cục FastShip";

      if (targetStatus === "in_transit" || targetStatus === "picked_up") {
        shipment.status_text = "Đã lấy hàng - Đang luân chuyển qua kho trung chuyển";
        shipment.shipped_at = shipment.shipped_at || now;
        eventTitle = "Bưu tá đã lấy hàng thành công";
        eventLocation = "Kho đóng hàng Shop";
      } else if (targetStatus === "out_for_delivery") {
        shipment.status_text = "Bưu tá đang trên đường đi giao cho người nhận";
        eventTitle = "Bưu tá bắt đầu phát hàng";
        eventLocation = "Bưu cục phát gần nhất";
      } else if (targetStatus === "delivered") {
        shipment.status_text = "Giao hàng thành công - Khách đã nhận và ký xác nhận";
        shipment.delivered_at = now;
        eventTitle = "Giao hàng thành công";
        eventLocation = shipment.shipping_address;
      } else if (targetStatus === "delivery_failed") {
        shipment.status_text = "Giao không thành công - Chờ liên hệ phát lại";
        eventTitle = "Giao hàng không thành công";
        eventLocation = shipment.shipping_address;
      }

      if (!Array.isArray(shipment.events)) shipment.events = [];
      shipment.events.unshift({
        id: "evt-" + randomUUID().slice(0, 8),
        status: targetStatus,
        title: eventTitle,
        location: eventLocation,
        description: note || shipment.status_text,
        occurred_at: now
      });

      saveDb();
      const webhookRes = await triggerWebhook(shipment, "status_updated");

      return sendJson(res, 200, {
        success: true,
        message: `Đã đổi trạng thái vận đơn ${code} sang '${targetStatus}'.`,
        data: shipment,
        webhook_result: webhookRes
      });
    }

    // 6. POST /api/v1/shipments/:code/dispatch-webhook
    const webhookMatch = pathname.match(/^\/api\/v1\/shipments\/([^/]+)\/dispatch-webhook$/);
    if (webhookMatch && req.method === "POST") {
      const code = decodeURIComponent(webhookMatch[1]);
      const shipment = db.shipments.find(
        (s) => s.tracking_code.toLowerCase() === code.toLowerCase()
      );
      if (!shipment) {
        return sendJson(res, 404, { success: false, message: "Không tìm thấy vận đơn." });
      }
      const webhookRes = await triggerWebhook(shipment, "manual_sync");
      return sendJson(res, 200, {
        success: true,
        message: webhookRes.ok
          ? `Webhook đã bắn thành công tới Shop BE (HTTP ${webhookRes.status}).`
          : `Đã kích hoạt Webhook. Kết quả: ${webhookRes.error || webhookRes.statusText}`,
        webhook_result: webhookRes
      });
    }

    // 7. POST /api/v1/shipments/:code/cancel
    const cancelMatch = pathname.match(/^\/api\/v1\/shipments\/([^/]+)\/cancel$/);
    if (cancelMatch && req.method === "POST") {
      const code = decodeURIComponent(cancelMatch[1]);
      const shipment = db.shipments.find(
        (s) => s.tracking_code.toLowerCase() === code.toLowerCase()
      );
      if (!shipment) {
        return sendJson(res, 404, { success: false, message: "Không tìm thấy vận đơn." });
      }
      shipment.status = "cancelled";
      shipment.status_text = "Vận đơn đã bị hủy theo yêu cầu của Shop";
      shipment.events.unshift({
        id: "evt-" + randomUUID().slice(0, 8),
        status: "cancelled",
        title: "Hủy vận đơn",
        location: "Hệ thống FastShip",
        description: "Shop đã hủy yêu cầu vận chuyển kiện hàng này.",
        occurred_at: new Date().toISOString()
      });
      saveDb();
      await triggerWebhook(shipment, "cancelled");
      return sendJson(res, 200, { success: true, data: shipment });
    }

    return sendJson(res, 404, { success: false, message: "Endpoint không tồn tại." });
  } catch (err) {
    console.error("[FastShip API Error]", err);
    return sendJson(res, 500, { success: false, message: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 [FastShip Express] Backend REST API đang lắng nghe tại: http://localhost:${PORT}`);
  console.log(`   - GET  /api/v1/shipments              : Lấy danh sách vận đơn`);
  console.log(`   - GET  /api/v1/shipments/track/:code  : Tra cứu hành trình theo mã`);
  console.log(`   - POST /api/v1/shipments/create       : Tạo vận đơn từ Badminton Shop (port 8080)`);
  console.log(`   - POST /api/v1/shipments/calculate-fee: Tính cước vận chuyển`);
  console.log(`   - POST /api/v1/shipments/:code/advance-status: Đổi trạng thái Sandbox & Webhook\n`);
});
