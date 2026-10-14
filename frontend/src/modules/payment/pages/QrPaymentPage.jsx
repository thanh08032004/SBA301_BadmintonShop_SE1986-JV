import { useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router';
import '../assets/QrPaymentPage.css';

const paymentMethodNames = {
  mbbank: 'MB Bank',
  momo: 'Ví MoMo',
  card: 'Thanh toán online',
};

const formatPrice = (price) => `${price.toLocaleString('vi-VN')}₫`;

function QrPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const payment = location.state;

  useEffect(() => {
    if (!payment || !Number.isFinite(payment.total) || !paymentMethodNames[payment.paymentMethod]) {
      navigate('/payment', { replace: true });
    }
  }, [navigate, payment]);

  if (!payment || !Number.isFinite(payment.total) || !paymentMethodNames[payment.paymentMethod]) {
    return null;
  }

  const methodName = paymentMethodNames[payment.paymentMethod];
  const qrContent = encodeURIComponent(
    `Badminton Shop | ${methodName} | ${payment.orderCode} | ${payment.total}`
  );
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrContent}`;
  const instructions = payment.paymentMethod === 'momo'
    ? 'Sử dụng ứng dụng MoMo để quét mã QR.'
    : 'Sử dụng ứng dụng MB Bank hoặc ứng dụng ngân hàng hỗ trợ quét QR.';

  return (
    <main className="qr-payment-page py-4 py-md-5">
      <Container>
        <section className="qr-payment-card">
          <p className="qr-payment-eyebrow mb-3">BADMINTON SHOP · THANH TOÁN</p>
          <p className="qr-payment-step mb-2">BƯỚC 2 / 2</p>
          <h1 className="h3 fw-bold mb-2">Quét mã QR để thanh toán</h1>
          <p className="qr-payment-instructions mb-4">{instructions}</p>

          <div className="qr-payment-code">
            <img
              src={qrImageUrl}
              alt={`Mã QR minh họa cho đơn hàng ${payment.orderCode}`}
              width="200"
              height="200"
            />
            <span>Minh họa mã QR</span>
          </div>

          <div className="qr-payment-amount">
            <span>Số tiền thanh toán</span>
            <strong>{formatPrice(payment.total)}</strong>
          </div>

          <div className="qr-payment-details">
            <div>
              <span>Người nhận</span>
              <strong>Badminton Shop</strong>
            </div>
            <div>
              <span>Nội dung chuyển khoản</span>
              <strong>{payment.orderCode}</strong>
            </div>
            <div>
              <span>Trạng thái</span>
              <strong className="qr-payment-pending">Đang chờ thanh toán</strong>
            </div>
          </div>

          <div className="qr-payment-waiting" role="status">
            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
            <span>Hệ thống đang chờ xác nhận giao dịch...</span>
          </div>

          <p className="qr-payment-disclaimer mb-3">
            Đây là bản minh họa giao diện, mã QR không dùng để thanh toán thật.
          </p>
          <Button variant="outline-secondary" onClick={() => navigate('/payment')}>
            Quay lại chọn phương thức
          </Button>
        </section>
      </Container>
    </main>
  );
}

export default QrPaymentPage;
