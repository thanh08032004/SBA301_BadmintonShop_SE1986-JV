import { useLocation } from "react-router";
import { Alert, Badge, Button, Card } from "react-bootstrap";
import { Link } from "react-router";
import { useShop } from "../ShopContext";

const ticketTypes = {
  return: "Đổi trả",
  exchange: "Đổi sản phẩm",
  warranty: "Bảo hành",
  complaint: "Khiếu nại",
};

const ticketStatuses = {
  open: { label: "Mới gửi", variant: "primary" },
  under_review: { label: "Đang xem xét", variant: "warning" },
  approved: { label: "Đã chấp thuận", variant: "success" },
  rejected: { label: "Từ chối", variant: "danger" },
  resolved: { label: "Đã hoàn tất", variant: "success" },
  cancelled: { label: "Đã hủy", variant: "secondary" },
};

function formatDate(date) {
  return new Date(date).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function MySupportTicketsPage() {
  const { data } = useShop();
  const { state } = useLocation();
  const supportTickets = [...(data.support_tickets || [])].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  return (
    <>
      <div className="eyebrow">HỖ TRỢ KHÁCH HÀNG</div>
      <h1 className="h2 fw-bold mb-2">Support Tickets</h1>
      <p className="text-secondary mb-4">
        Theo dõi các phiếu hỗ trợ đổi trả, bảo hành và đơn hàng của bạn.
      </p>
      {state?.created && (
        <Alert variant="success">
          Phiếu hỗ trợ của bạn đã được gửi thành công.
        </Alert>
      )}
      <div className="d-flex justify-content-end mb-3">
        <Button as={Link} to="/support-tickets/create">
          Tạo phiếu hỗ trợ
        </Button>
      </div>

      {supportTickets.length === 0 ? (
        <div className="empty-state">
          <h2 className="h5 fw-bold">Bạn chưa có phiếu hỗ trợ nào</h2>
          <p className="text-secondary">
            Các phiếu hỗ trợ đã gửi sẽ được hiển thị tại đây.
          </p>
          <Button as={Link} to="/orders" variant="outline-primary">
            Xem đơn hàng của tôi
          </Button>
        </div>
      ) : (
        supportTickets.map((ticket) => {
          const status = ticketStatuses[ticket.status] || {
            label: ticket.status,
            variant: "secondary",
          };
          const order = data.orders.find(
            (item) => item.id === ticket.order_id,
          );

          return (
            <Card key={ticket.id} className="border-0 mb-3">
              <Card.Body className="p-4">
                <div className="d-flex flex-wrap justify-content-between gap-3">
                  <div>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <h2 className="h6 fw-bold mb-0">
                        {ticket.ticket_code}
                      </h2>
                      <Badge bg="light" text="dark">
                        {ticketTypes[ticket.ticket_type] ||
                          ticket.ticket_type}
                      </Badge>
                    </div>
                    <div className="small text-secondary">
                      Gửi lúc {formatDate(ticket.created_at)}
                      {order && <> · Đơn hàng {order.order_code}</>}
                    </div>
                  </div>
                  <Badge
                    bg={status.variant}
                    text={status.variant === "warning" ? "dark" : undefined}
                    className="align-self-start"
                  >
                    {status.label}
                  </Badge>
                </div>

                <hr />
                <p className="fw-semibold mb-1">{ticket.reason}</p>
                {ticket.description && (
                  <p className="text-secondary mb-2">{ticket.description}</p>
                )}
                {ticket.proposed_resolution && (
                  <div className="small rounded bg-light p-3 mt-3">
                    <strong>Phản hồi từ cửa hàng:</strong>{" "}
                    {ticket.proposed_resolution}
                  </div>
                )}
              </Card.Body>
            </Card>
          );
        })
      )}
    </>
  );
}
