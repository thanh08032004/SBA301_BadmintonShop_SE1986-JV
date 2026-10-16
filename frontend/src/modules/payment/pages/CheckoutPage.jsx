import { Alert, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router';
import PaymentSummary from '../components/PaymentSummary';
import usePayment from '../hooks/usePayment';
import PaymentPage from './PaymentPage';
import '../assets/PaymentPage.css';

function CheckoutPage() {
  const payment = usePayment();

  if (payment.loading) return <Container className="py-5 text-center"><Spinner animation="border" /><p>Đang tải đơn hàng…</p></Container>;
  if (!payment.available) return <Container className="py-5"><Alert variant="info">{payment.error || 'Chọn đơn hàng trả trước để tiếp tục thanh toán.'}</Alert><Button as={Link} to="/orders">Xem đơn hàng</Button></Container>;
  return (
    <main className="payment-page">
      <Container>
        <div className="payment-heading mb-4">
          <h1 className="h3 fw-bold mb-2">Thanh toán</h1>
          <p className="text-secondary mb-0">Chọn phương thức thanh toán để hoàn tất đơn hàng.</p>
        </div>

        {payment.error && <Alert variant="danger">{payment.error}</Alert>}
        <p className="text-secondary">Đơn hàng: <strong>{payment.order.order_code}</strong></p>
        <Row className="g-4 align-items-start">
          <Col lg={7}>
            <PaymentPage
              paymentMethod={payment.paymentMethod}
              onPaymentMethodChange={payment.setPaymentMethod}
              onSubmit={payment.startPayment}
              busy={payment.busy}
              paid={payment.order.payment_status === 'paid'}
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
                    as={Link}
                    to="/orders"
                  >
                    Xem đơn hàng
                  </Button>
                </div>
                <p className="delivery-recipient fw-semibold mb-1">{payment.order.receiver_name} <span>•</span> {payment.order.receiver_phone}</p>
                <p className="text-secondary small mb-0">{payment.order.shipping_address}</p>
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
