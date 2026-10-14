import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import PaymentSummary from '../components/PaymentSummary';
import usePayment from '../hooks/usePayment';
import PaymentPage from './PaymentPage';
import '../assets/PaymentPage.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const payment = usePayment();

  return (
    <main className="payment-page py-4 py-lg-5">
      <Container>
        <div className="payment-heading mb-4">
          <p className="payment-eyebrow mb-2">BADMINTON SHOP</p>
          <h1 className="h3 fw-bold mb-2">Thanh toán</h1>
          <p className="text-secondary mb-0">Chọn phương thức thanh toán để hoàn tất đơn hàng.</p>
        </div>

        <Row className="g-4 align-items-start">
          <Col lg={7}>
            <PaymentPage
              paymentMethod={payment.paymentMethod}
              onPaymentMethodChange={payment.setPaymentMethod}
              onSubmit={payment.startPayment}
            />
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

            <PaymentSummary
              isExpanded={payment.isOrderExpanded}
              items={payment.orderItems}
              onToggle={() => payment.setIsOrderExpanded((expanded) => !expanded)}
              shippingFee={payment.shippingFee}
              subtotal={payment.subtotal}
              total={payment.total}
            />
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default CheckoutPage;
