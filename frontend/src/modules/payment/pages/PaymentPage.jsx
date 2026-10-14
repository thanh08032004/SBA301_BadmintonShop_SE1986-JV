import { useState } from 'react';
import { Button, Card, Col, Collapse, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import '../assets/PaymentPage.css';

const paymentMethods = [
  { id: 'mbbank', name: 'MB Bank', description: 'Quét mã QR bằng ứng dụng ngân hàng MB Bank', mark: 'MB' },
  { id: 'momo', name: 'Ví MoMo', description: 'Thanh toán nhanh bằng ví MoMo', mark: 'M' },
  { id: 'card', name: 'Thẻ quốc tế', description: 'Visa, Mastercard, JCB', mark: 'CARD' },
];

const orderItems = [
  { name: 'Vợt cầu lông Yonex Astrox', detail: '4U / Xanh đen', quantity: 1, price: 1890000 },
  { name: 'Ống cầu lông lông vũ', detail: 'Hộp 12 quả', quantity: 2, price: 420000 },
];

const formatPrice = (price) => `${price.toLocaleString('vi-VN')}₫`;

function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState('mbbank');
  const [isOrderExpanded, setIsOrderExpanded] = useState(false);
  const navigate = useNavigate();
  const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingFee = 30000;
  const total = subtotal + shippingFee;

  const handlePayment = (event) => {
    event.preventDefault();
    navigate('/payment/qr', {
      state: {
        paymentMethod,
        total,
        orderCode: 'DH123456',
      },
    });
  };

  return (
    <main className="payment-page py-4 py-lg-5">
      <Container>
        <div className="payment-heading mb-4">
          <p className="payment-eyebrow mb-2">BADMINTON SHOP</p>
          <h1 className="h3 fw-bold mb-2">Thanh toán</h1>
          <p className="text-secondary mb-0">Chọn phương thức thanh toán để hoàn tất đơn hàng.</p>
        </div>

        <Form onSubmit={handlePayment}>
          <Row className="g-4 align-items-start">
            <Col lg={7}>
              <Card className="payment-card h-100">
                <Card.Body className="p-4 p-md-5">
                  <div className="mb-4">
                    <p className="payment-step mb-2">BƯỚC 1 / 2</p>
                    <h2 className="h5 fw-bold mb-1">Chọn phương thức thanh toán Online</h2>
                    <p className="small text-secondary mb-0">Chọn cách bạn muốn thanh toán đơn hàng.</p>
                  </div>

                  <div className="payment-method-list">
                    {paymentMethods.map((method) => (
                      <label
                        className={`payment-method ${paymentMethod === method.id ? 'is-selected' : ''}`}
                        htmlFor={`payment-${method.id}`}
                        key={method.id}
                      >
                        <Form.Check
                          id={`payment-${method.id}`}
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          aria-label={method.name}
                        />
                        <span className={`payment-method-mark payment-method-mark-${method.id}`} aria-hidden="true">
                          {method.mark}
                        </span>
                        <span className="payment-method-copy">
                          <span className="payment-method-name">{method.name}</span>
                          <span className="payment-method-description">{method.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <p className="payment-note small text-secondary mt-3 mb-0">
                      Bạn sẽ được hướng dẫn thanh toán qua cổng thanh toán trực tuyến sau khi xác nhận đơn hàng.
                    </p>
                  )}

                  <div className="payment-security mt-4">
                    <span aria-hidden="true">✓</span>
                    Thanh toán an toàn và bảo mật
                  </div>
                  <Button className="payment-submit w-100 mt-4" type="submit" size="lg">
                    Thanh toán ngay <span aria-hidden="true">→</span>
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={5}>
              <Card className="delivery-card mb-3">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                    <div>
                      <p className="payment-step mb-2">THÔNG TIN GIAO HÀNG</p>
                      <h2 className="h6 fw-bold mb-0">Giao đến</h2>
                    </div>
                    <Button
                      className="delivery-edit"
                      variant="link"
                      type="button"
                      onClick={() => navigate('/order')}
                    >
                      Sửa
                    </Button>
                  </div>
                  <p className="delivery-recipient fw-semibold mb-1">Nguyễn Văn A <span>•</span> 090 123 4567</p>
                  <p className="text-secondary small mb-0">12 Nguyễn Trãi, Thanh Xuân, Hà Nội</p>
                </Card.Body>
              </Card>

              <Card className="review-card">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="payment-step mb-2">ĐƠN HÀNG CỦA BẠN</p>
                      <h2 className="h5 fw-bold mb-0">Review &amp; Summary</h2>
                    </div>
                    <span className="review-item-count">{orderItems.reduce((count, item) => count + item.quantity, 0)} món</span>
                  </div>

                  <Button
                    className="order-list-toggle w-100"
                    variant="light"
                    type="button"
                    aria-expanded={isOrderExpanded}
                    onClick={() => setIsOrderExpanded((expanded) => !expanded)}
                  >
                    <span>{isOrderExpanded ? 'Ẩn danh sách sản phẩm' : 'Xem danh sách sản phẩm'}</span>
                    <span aria-hidden="true">{isOrderExpanded ? '−' : '+'}</span>
                  </Button>
                  <Collapse in={isOrderExpanded}>
                    <div className="review-items">
                      {orderItems.map((item) => (
                        <div className="review-item" key={item.name}>
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
            </Col>
          </Row>
        </Form>
      </Container>
    </main>
  );
}

export default PaymentPage;
