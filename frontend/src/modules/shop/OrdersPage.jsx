import { Alert, Badge, Button, Card } from "react-bootstrap";
import { Link, useLocation } from "react-router";
import { useShop, money } from "./ShopContext";
export default function OrdersPage() {
  const { data } = useShop(),
    { state } = useLocation();
  return (
    <>
      <div className="eyebrow">LỊCH SỬ MUA SẮM</div>
      <h1 className="h2 fw-bold mb-4">Đơn hàng của tôi</h1>
      {state?.placed && (
        <Alert variant="success">
          Đặt hàng thành công! Đơn hàng của bạn đang chờ xác nhận.
        </Alert>
      )}
      {!data.orders.length && (
        <div className="empty-state">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Button as={Link} to="/products">
            Mua sắm ngay
          </Button>
        </div>
      )}
      {[...data.orders].reverse().map((o) => (
        <Card key={o.id} className="border-0 mb-4">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between gap-2">
              <div>
                <h2 className="h6 fw-bold">{o.order_code}</h2>
                <small className="text-secondary">
                  {new Date(o.created_at).toLocaleString("vi-VN")}
                </small>
              </div>
              <Badge bg="info" text="dark" className="align-self-start">
                Chờ xác nhận
              </Badge>
            </div>
            <hr />
            {data.order_items
              .filter((i) => i.order_id === o.id)
              .map((i) => (
                <div className="summary-row" key={i.id}>
                  <span>
                    {i.product_name}
                    <small className="d-block text-secondary">
                      {i.variant_info} × {i.quantity}
                    </small>
                  </span>
                  <strong>{money(i.line_total)}</strong>
                </div>
              ))}
            <hr />
            <p className="mb-1">
              {o.receiver_name} · {o.receiver_phone}
            </p>
            <p className="small text-secondary">{o.shipping_address}</p>
            {o.note && <p className="small">Ghi chú: {o.note}</p>}
            <div className="summary-row small">
              <span>Phí vận chuyển</span>
              <span>{money(o.shipping_fee)}</span>
            </div>
            <div className="summary-row">
              <span>
                {data.payments.find((p) => p.order_id === o.id)?.method ===
                "cod"
                  ? "COD"
                  : "Trả trước"}{" "}
                ·{" "}
                {o.payment_status === "paid"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </span>
              <strong className="text-primary">{money(o.total_amount)}</strong>
            </div>
            {o.payment_status === "unpaid" &&
              data.payments.some(
                (p) => p.order_id === o.id && p.method !== "cod",
              ) && (
                <Button
                  as={Link}
                  to={"/payments?order=" + encodeURIComponent(o.id)}
                  variant="outline-primary"
                  className="mt-2"
                >
                  Tiếp tục thanh toán
                </Button>
              )}
          </Card.Body>
        </Card>
      ))}
    </>
  );
}
