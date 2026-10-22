import { useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import { useShop } from '@/app/providers/shop/ShopContext';
import { supportApi } from '@/modules/support/api/support.api';

const ticketTypes = [
  { value: 'return', label: 'Đổi trả' },
  { value: 'exchange', label: 'Đổi sản phẩm' },
  { value: 'warranty', label: 'Bảo hành' },
  { value: 'complaint', label: 'Khiếu nại' },
];

export default function CreateSupportTicketPage() {
  const { data, busy, act } = useShop();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [ticketType, setTicketType] = useState('warranty');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const orders = [...data.orders].reverse();

  async function submitSupportTicket(event) {
    event.preventDefault();
    setError('');
    try {
      await act(() =>
        supportApi.createTicket({
          order_id: orderId,
          ticket_type: ticketType,
          reason,
          description,
        }),
      );
      navigate('/support-tickets', { state: { created: true } });
    } catch (ticketError) {
      setError(ticketError.message || 'Không thể gửi phiếu hỗ trợ. Vui lòng thử lại.');
    }
  }

  return (
    <>
      <div className="eyebrow">HỖ TRỢ KHÁCH HÀNG</div>
      <h1 className="h2 fw-bold mb-2">Tạo phiếu hỗ trợ</h1>
      <p className="text-secondary mb-4">Gửi phiếu hỗ trợ liên quan đến một đơn hàng của bạn.</p>

      {error && <Alert variant="danger">{error}</Alert>}
      {orders.length === 0 ? (
        <div className="empty-state">
          <h2 className="h5 fw-bold">Bạn chưa có đơn hàng</h2>
          <p className="text-secondary">Bạn cần có đơn hàng trước khi gửi phiếu hỗ trợ.</p>
          <Button as={Link} to="/orders">
            Xem đơn hàng
          </Button>
        </div>
      ) : (
        <Card className="border-0">
          <Card.Body className="p-4">
            <Form onSubmit={submitSupportTicket}>
              <Form.Group className="mb-3" controlId="ticket-order">
                <Form.Label>Đơn hàng</Form.Label>
                <Form.Select
                  required
                  value={orderId}
                  onChange={(event) => setOrderId(event.target.value)}
                >
                  <option value="">Chọn đơn hàng</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.order_code}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="ticket-type">
                <Form.Label>Loại phiếu hỗ trợ</Form.Label>
                <Form.Select
                  value={ticketType}
                  onChange={(event) => setTicketType(event.target.value)}
                >
                  {ticketTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="ticket-reason">
                <Form.Label>Lý do</Form.Label>
                <Form.Control
                  required
                  maxLength={300}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Nhập lý do gửi phiếu hỗ trợ"
                />
                <Form.Text muted>Tối đa 300 ký tự.</Form.Text>
              </Form.Group>

              <Form.Group className="mb-4" controlId="ticket-description">
                <Form.Label>Mô tả chi tiết</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  maxLength={5000}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Mô tả thêm vấn đề bạn gặp phải (không bắt buộc)"
                />
              </Form.Group>

              <div className="d-flex flex-wrap gap-2">
                <Button type="submit" disabled={busy || !orderId}>
                  {busy ? 'Đang gửi...' : 'Gửi phiếu hỗ trợ'}
                </Button>
                <Button as={Link} to="/support-tickets" variant="outline-secondary" disabled={busy}>
                  Hủy
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </>
  );
}
