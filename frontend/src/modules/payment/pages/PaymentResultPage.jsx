import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router';
import PaymentStatus from '../components/PaymentStatus';
import { getTransactionStatus, isValidPayment } from '../utils/paymentMapper';
import '../assets/PaymentResultPage.css';

function PaymentResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const payment = location.state?.payment;
  const requestedStatus = new URLSearchParams(location.search).get('status')
    ?? location.state?.status
    ?? 'pending';
  const status = getTransactionStatus(requestedStatus);

  useEffect(() => {
    if (!isValidPayment(payment) || !status) {
      navigate('/payment', { replace: true });
    }
  }, [navigate, payment, status]);

  if (!isValidPayment(payment) || !status) {
    return null;
  }

  return (
    <main className="payment-result-page py-4 py-md-5">
      <Container>
        <PaymentStatus
          payment={payment}
          status={status}
          showRetry={requestedStatus === 'failed'}
          onRetry={() => navigate('/payment')}
          onHome={() => navigate('/')}
        />
      </Container>
    </main>
  );
}

export default PaymentResultPage;
