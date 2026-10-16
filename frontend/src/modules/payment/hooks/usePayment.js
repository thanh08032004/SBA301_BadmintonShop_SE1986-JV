import { apiFetch } from '../../../shared/utils/apiFetch';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { paymentMethods } from '../constants/paymentConstants';

export default function usePayment() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [isOrderExpanded, setIsOrderExpanded] = useState(true);
  const navigate = useNavigate();
  const lock = useRef(false);
  useEffect(() => {
    if (!orderId) return;
    const controller = new AbortController();
    apiFetch('/api/shop', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Không tải được đơn hàng.');
      return response.json();
    }).then(data => setSnapshot({ orderId, data })).catch(err => {
      if (err.name !== 'AbortError') setError('Không tải được đơn hàng. Hãy kiểm tra server và tải lại trang.');
    });
    return () => controller.abort();
  }, [orderId]);
  const data = snapshot?.orderId === orderId ? snapshot.data : null;
  const order = data?.orders.find(o => o.id === orderId);
  const record = data?.payments.find(p => p.order_id === orderId);
  const orderItems = (data?.order_items || []).filter(i => i.order_id === orderId).map(i => ({ id: i.id, name: i.product_name, detail: i.variant_info, quantity: i.quantity, price: i.unit_price }));
  const available = !!order && !!record && record.method !== 'cod' && order.status !== 'cancelled';
  const payment = available ? { orderId, orderCode: order.order_code, total: order.total_amount, paymentMethod: record.gateway || paymentMethod } : null;
  async function startPayment(event) {
    event.preventDefault();
    if (lock.current || !available) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const response = await apiFetch('/api/shop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'start_payment', order_id: orderId, gateway: paymentMethod }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setSnapshot({ orderId, data: result });
      navigate('/payment/qr?order=' + encodeURIComponent(orderId));
    } catch (err) { setError(err.message); }
    finally { lock.current = false; setBusy(false); }
  }
  return { orderId, order, payment, record, available, loading: !!orderId && !data && !error, error, busy, paymentMethod, setPaymentMethod, isOrderExpanded, setIsOrderExpanded, orderItems, subtotal: order?.subtotal || 0, shippingFee: order?.shipping_fee || 0, total: order?.total_amount || 0, startPayment };
}
