import { Badge, Button, Card } from 'react-bootstrap';
import { Link, useParams } from 'react-router';
import { useShop } from '@/app/providers/shop/ShopContext';
import { formatDateTime, formatMoney } from '@/shared/utils/format';
import { resolutionTypes, ticketStatuses, ticketTypes } from '@/modules/support/constants';

export default function SupportTicketDetailPage() {
  const { ticketId } = useParams();
  const { data } = useShop();
  const ticket = (data.support_tickets || []).find((item) => String(item.id) === ticketId);

  if (!ticket) {
    return (
      <>
        <div className="eyebrow">HỖ TRỢ KHÁCH HÀNG</div>
        <h1 className="h2 fw-bold mb-2">Không tìm thấy phiếu hỗ trợ</h1>
        <p className="text-secondary mb-4">
          Phiếu hỗ trợ không tồn tại hoặc không thuộc tài khoản của bạn.
        </p>
        <Button as={Link} to="/support-tickets" variant="outline-primary">
          Quay lại danh sách phiếu hỗ trợ
        </Button>
      </>
    );
  }

  const status = ticketStatuses[ticket.status] || {
    label: ticket.status || 'Chưa xác định',
    variant: 'secondary',
  };
  const order = data.orders.find((item) => item.id === ticket.order_id);
  const orderItems = (data.order_items || []).filter((item) => item.order_id === ticket.order_id);
  const ticketItems = (data.ticket_items || [])
    .filter((item) => item.ticket_id === ticket.id)
    .map((item) => ({
      ...item,
      orderItem: orderItems.find((orderItem) => orderItem.id === item.order_item_id),
    }))
    .filter((item) => item.orderItem);

  return (
    <>
      <div className="eyebrow">HỖ TRỢ KHÁCH HÀNG</div>
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-2">Chi tiết phiếu hỗ trợ</h1>
          <p className="text-secondary mb-0">
            Theo dõi thông tin và kết quả xử lý phiếu hỗ trợ của bạn.
          </p>
        </div>
        <Button as={Link} to="/support-tickets" variant="outline-secondary">
          Quay lại danh sách
        </Button>
      </div>

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
                    {resolutionTypes[ticket.resolution_type] || ticket.resolution_type}
                  </Badge>
                )}
              </div>
            </div>
            <Badge
              bg={status.variant}
              text={status.variant === 'warning' ? 'dark' : undefined}
              className="align-self-start"
            >
              {status.label}
            </Badge>
          </div>
          <hr />
          <div className="row g-3">
            <div className="col-sm-6">
              <div className="small text-secondary">Ngày gửi</div>
              <div className="fw-semibold">{formatDateTime(ticket.created_at)}</div>
            </div>
            <div className="col-sm-6">
              <div className="small text-secondary">Cập nhật lần cuối</div>
              <div className="fw-semibold">{formatDateTime(ticket.updated_at)}</div>
            </div>
            {ticket.reviewed_at && (
              <div className="col-sm-6">
                <div className="small text-secondary">Ngày tiếp nhận xử lý</div>
                <div className="fw-semibold">{formatDateTime(ticket.reviewed_at)}</div>
              </div>
            )}
            {ticket.resolved_at && (
              <div className="col-sm-6">
                <div className="small text-secondary">Ngày hoàn tất</div>
                <div className="fw-semibold">{formatDateTime(ticket.resolved_at)}</div>
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
                {ticket.description || 'Bạn chưa cung cấp mô tả chi tiết.'}
              </p>
              {ticketItems.length > 0 && (
                <>
                  <hr />
                  <h3 className="h6 fw-bold mb-3">Sản phẩm liên quan</h3>
                  {ticketItems.map(({ id, quantity, orderItem }) => (
                    <div className="d-flex justify-content-between gap-3 mb-2" key={id}>
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
              <h2 className="h5 fw-bold mb-3">Thông tin đơn hàng</h2>
              {order ? (
                <>
                  <div className="small text-secondary mb-1">Mã đơn hàng</div>
                  <p className="fw-semibold">{order.order_code}</p>
                  <div className="small text-secondary mb-1">Ngày đặt hàng</div>
                  <p className="fw-semibold">{formatDateTime(order.created_at)}</p>
                  <div className="small text-secondary mb-1">Người nhận</div>
                  <p className="fw-semibold mb-1">{order.receiver_name || 'Chưa cập nhật'}</p>
                  {order.receiver_phone && <p className="text-secondary">{order.receiver_phone}</p>}
                  {order.shipping_address && (
                    <>
                      <div className="small text-secondary mb-1">Địa chỉ giao hàng</div>
                      <p className="mb-0">{order.shipping_address}</p>
                    </>
                  )}
                </>
              ) : (
                <p className="text-secondary mb-0">Không tìm thấy thông tin đơn hàng liên quan.</p>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {ticket.proposed_resolution && (
        <Card className="border-0 mt-4">
          <Card.Body className="p-4">
            <h2 className="h5 fw-bold mb-3">Phản hồi từ cửa hàng</h2>
            <p className="mb-2 text-break">{ticket.proposed_resolution}</p>
            {ticket.proposed_refund_amount != null && (
              <div className="fw-semibold text-primary">
                Số tiền hoàn dự kiến: {formatMoney(ticket.proposed_refund_amount)}
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
}
