import { useState } from 'react';
import { useNavigate } from 'react-router';
import { orderItems, paymentMethods, shippingFee } from '../constants/paymentConstants';

function usePayment() {
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [isOrderExpanded, setIsOrderExpanded] = useState(false);
  const navigate = useNavigate();
  const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = subtotal + shippingFee;

  const startPayment = (event) => {
    event.preventDefault();
    navigate('/payment/qr', {
      state: {
        paymentMethod,
        total,
        orderCode: 'DH123456',
      },
    });
  };

  return {
    isOrderExpanded,
    orderItems,
    paymentMethod,
    setIsOrderExpanded,
    setPaymentMethod,
    shippingFee,
    startPayment,
    subtotal,
    total,
  };
}

export default usePayment;
