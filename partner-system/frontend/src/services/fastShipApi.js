const API_BASE = "http://localhost:8081/api/v1/shipments";

export async function trackShipment(code) {
  const res = await fetch(`${API_BASE}/track/${encodeURIComponent(code)}`);
  const json = await res.json();
  if (!res.ok || !json.data) {
    throw new Error(json.message || "Không tìm thấy vận đơn trên hệ thống FastShip.");
  }
  return json.data;
}

export async function advanceShipmentStatus(code, status, note = "") {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(code)}/advance-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, note })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Lỗi mô phỏng trạng thái.");
  return json.data;
}

export async function dispatchWebhook(code) {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(code)}/dispatch-webhook`, {
    method: "POST"
  });
  return res.json();
}
