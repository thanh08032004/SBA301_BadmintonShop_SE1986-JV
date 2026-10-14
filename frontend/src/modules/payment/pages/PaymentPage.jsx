import { Button, Card, Form } from 'react-bootstrap';
import PaymentMethodSelector from '../components/PaymentMethodSelector';

function PaymentPage({ paymentMethod, onPaymentMethodChange, onSubmit }) {
  return (
    <Card className="payment-card h-100">
      <Card.Body className="p-4 p-md-5">
        <div className="mb-4">
          <p className="payment-step mb-2">BƯỚC 1 / 2</p>
          <h2 className="h5 fw-bold mb-1">Chọn phương thức thanh toán Online</h2>
          <p className="small text-secondary mb-0">Chọn cách bạn muốn thanh toán đơn hàng.</p>
        </div>

        <Form onSubmit={onSubmit}>
          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            onChange={onPaymentMethodChange}
          />

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
        </Form>
      </Card.Body>
    </Card>
  );
}

export default PaymentPage;
