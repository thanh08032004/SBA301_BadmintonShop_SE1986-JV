import { useContext, useState } from "react";
import { Alert, Badge, Button, Card, Form } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router";
import { AuthsContext } from "../../../app/provider/AuthsContext";
import {
  manageableTicketStatuses,
  resolutionTypes,
  ticketStatuses,
  ticketTypes,
} from "../supportTicketConstants";
import { money, useShop } from "../../shop/ShopContext";

function formatDate(date) {
  if (!date) return "Chưa cập nhật";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Chưa cập nhật";
  return parsedDate.toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SupportTicketManagementDetailPage() {
  const { ticketId } = useParams();
  const { data, busy, act } = useShop();
  const { user } = useContext(AuthsContext);
  const navigate = useNavigate();
  const ticket = (data.support_tickets || []).find(
    (item) => String(item.id) === ticketId,
  );
  const [status, setStatus] = useState(() =>
    ticket?.status === "open" ? "under_review" : ticket?.status || "under_review",
  );
  const [resolutionType, setResolutionType] = useState(
    ticket?.resolution_type || "",
  );
  const [resolution, setResolution] = useState(
    ticket?.proposed_resolution || "",
  );
  const [refundAmount, setRefundAmount] = useState(
    ticket?.proposed_refund_amount ?? "",
  );
  const [error, setError] = useState("");

  if (!ticket) {
    return (
      <>
        <h1 className="h2 fw-bold mb-2">Không tìm thấy phiếu hỗ trợ</h1>
        <p className="text-secondary mb-4">
          Phiếu hỗ trợ không tồn tại hoặc đã bị xóa.
        </p>
        <Button as={Link} to="/management/support-tickets" variant="outline-primary">
          Quay lại danh sách
        </Button>
      </>
    );
  }

  const order = (data.orders || []).find(
    (item) => item.id === ticket.order_id,
  );
  const orderItems = (data.order_items || []).filter(
    (item) => item.order_id === ticket.order_id,
  );
  const ticketItems = (data.ticket_items || [])
    .filter((item) => item.ticket_id === ticket.id)
    .map((item) => ({
      ...item,
      orderItem: orderItems.find(
        (orderItem) => orderItem.id === item.order_item_id,
      ),
    }))
    .filter((item) => item.orderItem);
  const currentStatus = ticketStatuses[ticket.status] || {
    label: ticket.status || "Chưa xác định",
    variant: "secondary",
  };

  async function submitResolution(event) {
    event.preventDefault();
    setError("");
    try {
      await act({
        type: "update_support_ticket",
        ticket_id: ticket.id,
        status,
        resolution_type: resolutionType || null,
        proposed_resolution: resolution.trim(),
        proposed_refund_amount:
          resolutionType === "refund" && refundAmount !== ""
            ? Number(refundAmount)
            : null,
        handled_by: user?.id || user?.email || "",
      });
      navigate("/management/support-tickets", { state: { updated: true } });
    } catch (updateError) {
      setError(
        updateError.message || "Không thể cập nhật phiếu. Vui lòng thử lại.",
      );
    }
  }

  return (
    <section className="manager-page manager-support-page">
      <div className="eyebrow">QUẢN LÝ VẬN HÀNH</div>
      <div className="manager-title">
        <div>
          <h1 className="h2 fw-bold mb-2">Xử lý support ticket</h1>
          <p className="text-secondary mb-0">
            Kiểm tra nội dung yêu cầu và cập nhật kết quả phản hồi khách hàng.
          </p>
        </div>
        <Button
          as={Link}
          to="/management/support-tickets"
          variant="outline-secondary"
        >
          Quay lại danh sách
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 mb-4">
        <Card.Body className="p-4">
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
              <div className="small text-secondary mb-1">Mã phiếu</div>
              <h2 className="h5 fw-bold mb-2">{ticket.ticket_code}</h2>
              <div className="d-flex flex-wrap gap-2">
                <Badge bg="light" text="dark">
                  {ticketTypes[ticket.ticket_type] || ticket.ticket_type}
                </Badge>
                {ticket.resolution_type && (
                  <Badge bg="light" text="dark">
                    {resolutionTypes[ticket.resolution_type] ||
                      ticket.resolution_type}
                  </Badge>
                )}
              </div>
            </div>
            <Badge
              bg={currentStatus.variant}
              text={currentStatus.variant === "warning" ? "dark" : undefined}
            >
              {currentStatus.label}
            </Badge>
          </div>
          <hr />
          <div className="row g-3">
            <div className="col-sm-6">
              <div className="small text-secondary">Ngày gửi</div>
              <div className="fw-semibold">{formatDate(ticket.created_at)}</div>
            </div>
            <div className="col-sm-6">
              <div className="small text-secondary">Cập nhật lần cuối</div>
              <div className="fw-semibold">{formatDate(ticket.updated_at)}</div>
            </div>
            {ticket.reviewed_at && (
              <div className="col-sm-6">
                <div className="small text-secondary">Ngày tiếp nhận</div>
                <div className="fw-semibold">{formatDate(ticket.reviewed_at)}</div>
              </div>
            )}
            {ticket.resolved_at && (
              <div className="col-sm-6">
                <div className="small text-secondary">Ngày hoàn tất</div>
                <div className="fw-semibold">{formatDate(ticket.resolved_at)}</div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      <div className="row g-4">
        <div className="col-lg-7">
          <Card className="border-0 h-100">
            <Card.Body className="p-4">
              <h2 className="h5 fw-bold mb-3">Nội dung yêu cầu</h2>
              <div className="small text-secondary mb-1">Lý do</div>
              <p className="fw-semibold">{ticket.reason}</p>
              <div className="small text-secondary mb-1">Mô tả chi tiết</div>
              <p className="mb-0 text-break">
                {ticket.description || "Khách hàng chưa cung cấp mô tả chi tiết."}
              </p>
              {ticketItems.length > 0 && (
                <>
                  <hr />
                  <h3 className="h6 fw-bold mb-3">Sản phẩm liên quan</h3>
                  {ticketItems.map(({ id, quantity, orderItem }) => (
                    <div
                      className="d-flex justify-content-between gap-3 mb-2"
                      key={id}
                    >
                      <span>
                        {orderItem.product_name}
                        {orderItem.variant_info && (
                          <span className="d-block small text-secondary">
                            {orderItem.variant_info}
                          </span>
                        )}
                      </span>
                      <span className="text-nowrap">× {quantity}</span>
                    </div>
                  ))}
                </>
              )}
            </Card.Body>
          </Card>
        </div>

        <div className="col-lg-5">
          <Card className="border-0 h-100">
            <Card.Body className="p-4">
              <h2 className="h5 fw-bold mb-3">Thông tin khách hàng / đơn hàng</h2>
              <div className="small text-secondary mb-1">Tài khoản</div>
              <p className="fw-semibold text-break">{ticket.user_id}</p>
              {order ? (
                <>
                  <div className="small text-secondary mb-1">Mã đơn hàng</div>
                  <p className="fw-semibold">{order.order_code}</p>
                  <div className="small text-secondary mb-1">Người nhận</div>
                  <p className="fw-semibold mb-1">
                    {order.receiver_name || "Chưa cập nhật"}
                  </p>
                  {order.receiver_phone && (
                    <p className="text-secondary">{order.receiver_phone}</p>
                  )}
                  {order.shipping_address && (
                    <>
                      <div className="small text-secondary mb-1">
                        Địa chỉ giao hàng
                      </div>
                      <p className="mb-0">{order.shipping_address}</p>
                    </>
                  )}
                </>
              ) : (
                <p className="text-secondary mb-0">
                  Không tìm thấy thông tin đơn hàng liên quan.
                </p>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card className="border-0 mt-4">
        <Card.Body className="p-4">
          <h2 className="h5 fw-bold mb-3">Cập nhật kết quả xử lý</h2>
          <Form onSubmit={submitResolution}>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group controlId="ticket-resolution-status">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    required
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    {manageableTicketStatuses.map((value) => (
                      <option key={value} value={value}>
                        {ticketStatuses[value].label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="ticket-resolution-type">
                  <Form.Label>Hướng xử lý</Form.Label>
                  <Form.Select
                    value={resolutionType}
                    onChange={(event) => setResolutionType(event.target.value)}
                  >
                    <option value="">Chọn hướng xử lý (không bắt buộc)</option>
                    {Object.entries(resolutionTypes).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              {resolutionType === "refund" && (
                <div className="col-md-6">
                  <Form.Group controlId="ticket-refund-amount">
                    <Form.Label>Số tiền hoàn dự kiến (VND)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="1"
                      value={refundAmount}
                      onChange={(event) => setRefundAmount(event.target.value)}
                      placeholder="Không bắt buộc"
                    />
                  </Form.Group>
                </div>
              )}
              <div className="col-12">
                <Form.Group controlId="ticket-resolution">
                  <Form.Label>Phản hồi khách hàng</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    maxLength={5000}
                    required={["approved", "rejected", "resolved"].includes(status)}
                    value={resolution}
                    onChange={(event) => setResolution(event.target.value)}
                    placeholder="Nêu rõ kết quả hoặc hướng dẫn tiếp theo cho khách hàng"
                  />
                  <Form.Text muted>Tối đa 5000 ký tự.</Form.Text>
                </Form.Group>
              </div>
            </div>
            {ticket.proposed_refund_amount != null && (
              <p className="small text-secondary mt-3 mb-0">
                Số tiền hoàn hiện tại:{" "}
                <strong>{money(ticket.proposed_refund_amount)}</strong>
              </p>
            )}
            <div className="d-flex flex-wrap gap-2 mt-4">
              <Button type="submit" disabled={busy}>
                {busy ? "Đang lưu..." : "Lưu kết quả xử lý"}
              </Button>
              <Button
                as={Link}
                to="/management/support-tickets"
                variant="outline-secondary"
                disabled={busy}
              >
                Hủy
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </section>
  );
}
