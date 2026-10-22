import { Form } from 'react-bootstrap';
import { paymentMethods } from '@/modules/payment/constants';

function PaymentMethodSelector({ paymentMethod, onChange }) {
  return (
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
            onChange={() => onChange(method.id)}
            aria-label={method.name}
          />
          <span
            className={`payment-method-mark payment-method-mark-${method.id}`}
            aria-hidden="true"
          >
            {method.mark}
          </span>
          <span className="payment-method-copy">
            <span className="payment-method-name">{method.name}</span>
            <span className="payment-method-description">{method.description}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

export default PaymentMethodSelector;
