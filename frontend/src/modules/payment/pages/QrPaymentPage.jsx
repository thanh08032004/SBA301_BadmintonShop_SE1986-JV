import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import PaymentQR from '../components/PaymentQR';
import { isValidPayment } from '../utils/paymentMapper';
import '../assets/QrPaymentPage.css';

function QrPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const payment = location.state;

  useEffect(() => {
    if (!isValidPayment(payment)) {
      navigate('/payment', { replace: true });
    }
  }, [navigate, payment]);

  if (!isValidPayment(payment)) {
    return null;
  }

  return (
    <PaymentQR
      payment={payment}
      onCheckResult={() => navigate('/payment/result', { state: { payment, status: 'pending' } })}
      onChooseAnotherMethod={() => navigate('/payment')}
    />
  );
}

export default QrPaymentPage;
