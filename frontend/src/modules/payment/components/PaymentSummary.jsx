import { Button, Card, Collapse } from 'react-bootstrap';
import { formatPrice } from '../utils/paymentMapper';

function PaymentSummary({
  isExpanded,
  items,
  onToggle,
  shippingFee,
  subtotal,
  total,
}) {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <Card className="review-card">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <p className="payment-step mb-2">ĐƠN HÀNG CỦA BẠN</p>
            <h2 className="h5 fw-bold mb-0">Chi tiết đơn hàng</h2>
          </div>
          <span className="review-item-count">{itemCount} món</span>
        </div>

        <Button
          className="order-list-toggle w-100"
          variant="light"
          type="button"
          aria-expanded={isExpanded}
          onClick={onToggle}
        >
          <span>{isExpanded ? 'Ẩn danh sách sản phẩm' : 'Xem danh sách sản phẩm'}</span>
          <span aria-hidden="true">{isExpanded ? '−' : '+'}</span>
        </Button>
        <Collapse in={isExpanded}>
          <div className="review-items">
            {items.map((item) => (
              <div className="review-item" key={item.id}>
                <div className="review-item-image" aria-hidden="true">BS</div>
                <div className="review-item-copy">
                  <p className="fw-semibold mb-1">{item.name}</p>
                  <p className="small text-secondary mb-0">{item.detail} · SL: {item.quantity}</p>
                </div>
                <span className="review-item-price">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </Collapse>

        <div className="review-totals mt-3">
          <div><span>Tạm tính</span><span>{formatPrice(subtotal)}</span></div>
          <div><span>Phí vận chuyển</span><span>{formatPrice(shippingFee)}</span></div>
        </div>
        <div className="review-grand-total">
          <span>Tổng thanh toán</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        <p className="review-caption small text-secondary mb-0 mt-3">
          Đã bao gồm thuế. Phí vận chuyển có thể thay đổi theo địa chỉ nhận hàng.
        </p>
      </Card.Body>
    </Card>
  );
}

export default PaymentSummary;
