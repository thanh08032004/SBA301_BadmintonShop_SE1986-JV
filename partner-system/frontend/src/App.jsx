import React, { useState, useEffect } from "react";
import { trackShipment, advanceShipmentStatus, dispatchWebhook } from "./services/fastShipApi";

function formatDate(iso) {
  if (!iso) return "Chưa cập nhật";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Chưa cập nhật";
  return d.toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" });
}

function formatMoney(amount) {
  return (Number(amount) || 0).toLocaleString("vi-VN") + " ₫";
}

function getStatusBadge(status) {
  switch (status) {
    case "pending_pickup": return { label: "Chờ lấy hàng", cls: "badge-warning" };
    case "picked_up":
    case "in_transit": return { label: "Đang trung chuyển", cls: "badge-info" };
    case "out_for_delivery": return { label: "Đang phát hàng", cls: "badge-primary" };
    case "delivered": return { label: "Giao thành công", cls: "badge-success" };
    case "delivery_failed": return { label: "Giao thất bại", cls: "badge-danger" };
    case "cancelled": return { label: "Đã hủy vận đơn", cls: "badge-danger" };
    default: return { label: status || "Đang xử lý", cls: "badge-info" };
  }
}

export default function App() {
  const [code, setCode] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sandboxLog, setSandboxLog] = useState("[Sẵn sàng] Kết nối tới Spring Boot API (Port 8081)");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialCode = params.get("code") || params.get("tracking_number") || "FS-882910";
    setCode(initialCode);
    setSearchInput(initialCode);
    loadData(initialCode);
  }, []);

  async function loadData(targetCode) {
    if (!targetCode) return;
    setLoading(true);
    setError("");
    try {
      const data = await trackShipment(targetCode);
      setShipment(data);
    } catch (err) {
      setError(err.message || "Không tìm thấy thông tin vận đơn.");
      setShipment(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      setCode(trimmed);
      const newUrl = window.location.pathname + "?code=" + encodeURIComponent(trimmed);
      window.history.pushState({}, "", newUrl);
      loadData(trimmed);
    }
  }

  async function handleSimulate(targetStatus, note) {
    if (!shipment) return;
    setSandboxLog(`[Đang gửi] Đang yêu cầu FastShip BE (Port 8081) chuyển trạng thái sang '${targetStatus}'...`);
    try {
      const updated = await advanceShipmentStatus(shipment.trackingCode, targetStatus, note);
      setShipment(updated);
      setSandboxLog(`[Thành công] Đã chuyển sang '${targetStatus}' & bắn Webhook tới Shop BE (Port 8080)!`);
    } catch (err) {
      setSandboxLog(`[Lỗi] ${err.message}`);
    }
  }

  async function handleTestWebhook() {
    if (!shipment) return;
    setSandboxLog(`[Đang gửi Webhook] Gửi thông báo vận đơn ${shipment.trackingCode} sang Shop BE...`);
    try {
      const res = await dispatchWebhook(shipment.trackingCode);
      setSandboxLog(`[Webhook Result] ${res.message || "Đã gửi tín hiệu Webhook thành công"}`);
    } catch (err) {
      setSandboxLog(`[Webhook Error] ${err.message}`);
    }
  }

  // Calculate step: 1 (pickup), 2 (in_transit), 3 (out), 4 (delivered)
  let step = 1;
  if (shipment) {
    if (shipment.status === "in_transit" || shipment.status === "picked_up") step = 2;
    else if (shipment.status === "out_for_delivery") step = 3;
    else if (shipment.status === "delivered") step = 4;
    else if (shipment.status === "delivery_failed") step = 3;
  }

  const badge = shipment ? getStatusBadge(shipment.status) : null;

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <a href="/track" className="brand">
            <div className="brand-logo">⚡</div>
            <div>
              <div className="brand-title">FastShip <span>Express</span></div>
              <div className="brand-sub">Đối tác vận chuyển chính thức - Port 8082</div>
            </div>
          </a>
          <div>
            <a href="tel:19006868" className="hotline-badge">
              📞 Tổng đài: <strong>1900 6868</strong>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="hero-banner">
        <h1 className="hero-title">Tra Cứu Hành Trình Bưu Phẩm</h1>
        <p className="hero-desc">Theo dõi vị trí và tiến độ giao nhận bưu kiện theo thời gian thực trên toàn quốc.</p>
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nhập mã vận đơn (VD: FS-882910, FS-449102)..."
          />
          <button type="submit" className="search-btn">Tra cứu 🔍</button>
        </form>
      </section>

      {/* Main Content */}
      <main className="main-content">
        {loading && (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <p>Đang kết nối tới FastShip Spring Boot API (Port 8081)...</p>
          </div>
        )}

        {error && !loading && (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "2.5rem", color: "var(--danger)" }}>⚠️</div>
            <h2 style={{ margin: "10px 0" }}>Không tìm thấy vận đơn</h2>
            <p style={{ color: "var(--gray-500)" }}>{error}</p>
          </div>
        )}

        {shipment && !loading && (
          <>
            <div className="card">
              <div className="overview-top">
                <div className="tracking-code-wrap">
                  <div>
                    <div className="info-label">MÃ VẬN ĐƠN BƯU PHẨM</div>
                    <div className="tracking-code">{shipment.trackingCode}</div>
                  </div>
                  <button className="btn-copy" onClick={() => navigator.clipboard.writeText(shipment.trackingCode)}>
                    Sao chép
                  </button>
                </div>
                <span className={`badge-status ${badge.cls}`}>{badge.label}</span>
              </div>

              {/* Stepper */}
              <div className="stepper">
                <div className={`step-item ${step >= 1 ? (step === 1 ? 'active' : 'completed') : ''}`}>
                  <div className="step-icon">{step > 1 ? '✓' : '1'}</div>
                  <div className="step-label">Tiếp nhận đơn</div>
                  <div className="step-desc">Shop tạo đơn</div>
                </div>
                <div className={`step-item ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}`}>
                  <div className="step-icon">{step > 2 ? '✓' : '2'}</div>
                  <div className="step-label">Bưu cục lấy hàng</div>
                  <div className="step-desc">Đang luân chuyển</div>
                </div>
                <div className={`step-item ${step >= 3 ? (step === 3 ? 'active' : 'completed') : ''}`}>
                  <div className="step-icon">{step > 3 ? '✓' : '3'}</div>
                  <div className="step-label">Đang phát hàng</div>
                  <div className="step-desc">Bưu tá đi giao</div>
                </div>
                <div className={`step-item ${step === 4 ? 'completed active' : ''}`}>
                  <div className="step-icon">{step === 4 ? '✓' : '4'}</div>
                  <div className="step-label">Giao thành công</div>
                  <div className="step-desc">Ký nhận kiện hàng</div>
                </div>
              </div>

              {/* Details & Timeline Grid */}
              <div className="details-grid">
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px" }}>
                    Lịch sử hành trình bưu cục
                  </h3>
                  <div className="timeline">
                    {(shipment.events || []).map((evt) => (
                      <div className="timeline-item" key={evt.id || evt.occurredAt}>
                        <div className="timeline-dot"></div>
                        <div className="timeline-time">{formatDate(evt.occurredAt)}</div>
                        <div className="timeline-title">{evt.title}</div>
                        <div className="timeline-location">📍 {evt.location}</div>
                        {evt.description && <div className="timeline-desc">{evt.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px" }}>
                    Thông tin kiện hàng & người nhận
                  </h3>
                  <div className="info-group">
                    <div className="info-label">Người nhận</div>
                    <div className="info-val" style={{ fontWeight: 600 }}>{shipment.receiverName}</div>
                    <div className="info-val" style={{ color: "var(--gray-500)", fontSize: "0.85rem" }}>
                      SĐT: {shipment.receiverPhone}
                    </div>
                  </div>
                  <div className="info-group">
                    <div className="info-label">Địa chỉ giao hàng</div>
                    <div className="info-val">{shipment.shippingAddress}</div>
                  </div>
                  <div className="info-group">
                    <div className="info-label">Sản phẩm & Khối lượng</div>
                    <div className="info-val">{shipment.packageDesc || "Sản phẩm cầu lông"}</div>
                    <div className="info-val" style={{ color: "var(--gray-500)", fontSize: "0.85rem" }}>
                      Khối lượng: {shipment.packageWeightGram || 500}g
                    </div>
                  </div>
                  <div className="info-group">
                    <div className="info-label">Dịch vụ & Thu hộ COD</div>
                    <div className="info-val" style={{ color: "var(--primary)", fontWeight: 700 }}>
                      {shipment.serviceName}
                    </div>
                    <div className="info-val" style={{ fontWeight: 700, color: shipment.codAmount > 0 ? "var(--danger)" : "var(--success)" }}>
                      COD: {formatMoney(shipment.codAmount)}
                    </div>
                  </div>

                  <div className="shipper-card">
                    <div className="shipper-avatar">🛵</div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", textTransform: "uppercase", fontWeight: 600 }}>
                        Bưu tá phụ trách
                      </div>
                      <div style={{ fontWeight: 700 }}>{shipment.shipperName || "Nguyễn Văn Tuấn (FastShip)"}</div>
                      <a href={`tel:${shipment.shipperPhone}`} style={{ color: "var(--primary)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600 }}>
                        📞 {shipment.shipperPhone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sandbox Simulation Tool */}
            <div className="sandbox-panel">
              <div className="sandbox-header">
                <div className="sandbox-title">🛠️ FASTSHIP CARRIER SANDBOX (DEMO CONTROL)</div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                  Mã: <strong>{shipment.trackingCode}</strong>
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                Bấm các nút dưới đây để mô phỏng bưu tá cập nhật trạng thái bưu kiện trên hệ thống FastShip Spring Boot (Port 8081).
                Hệ thống sẽ đồng thời tự động gọi Webhook sang <strong>Badminton Shop Backend (Port 8080)</strong>:
              </p>
              <div className="sandbox-buttons">
                <button className="btn-sim" onClick={() => handleSimulate("in_transit", "Bưu tá đã lấy hàng thành công và chuyển về kho trung chuyển")}>
                  🚚 1. Lấy hàng & Nhập kho
                </button>
                <button className="btn-sim" onClick={() => handleSimulate("out_for_delivery", "Bưu tá đang trên đường đi giao cho người nhận")}>
                  🛵 2. Bưu tá phát hàng
                </button>
                <button className="btn-sim sim-success" onClick={() => handleSimulate("delivered", "Khách hàng đã nhận kiện hàng nguyên vẹn và ký nhận")}>
                  ✅ 3. Giao thành công (Ký nhận)
                </button>
                <button className="btn-sim sim-danger" onClick={() => handleSimulate("delivery_failed", "Không liên lạc được người nhận, hẹn giao lại")}>
                  ⚠️ Giao thất bại
                </button>
                <button className="btn-sim" onClick={handleTestWebhook}>
                  🔄 Bắn lại Webhook về Shop
                </button>
              </div>
              <div className="sandbox-log">{sandboxLog}</div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
