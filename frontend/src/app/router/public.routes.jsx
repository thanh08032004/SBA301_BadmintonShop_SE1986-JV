import ProtectedRouter from './ProtectedRouter';
import PaymentLayout from '../layouts/PaymentLayout';
import PublicLayout from "../layouts/PublicLayout";
import Login from "../../modules/auth/pages/LoginPage";
import Register from "../../modules/auth/pages/RegisterPage";
import Checkout from "../../modules/payment/pages/CheckoutPage";
import QrPayment from "../../modules/payment/pages/QrPaymentPage";
import PaymentResult from "../../modules/payment/pages/PaymentResultPage";
import Home from "../../modules/home/pages/HomePage";
import ComplaintDashboard from "../../modules/complaint/pages/ComplaintDashboard";

import CartPage from '../../modules/shop/CartPage';
import OrderPage from '../../modules/shop/OrderPage';
import OrdersPage from '../../modules/shop/OrdersPage';
export const publicRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <ProtectedRouter />,
    children: [
      { path: '/payment', element: <PaymentLayout><Checkout /></PaymentLayout> },
      { path: '/payment/qr', element: <PaymentLayout><QrPayment /></PaymentLayout> },
      { path: '/payment/result', element: <PaymentLayout><PaymentResult /></PaymentLayout> },
      { path: '/complaint', element: <ComplaintDashboard /> },
    ],
  },
  {
    path: '/', element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Home catalog /> },
      {
        element: <ProtectedRouter />,
        children: [
          { path: 'cart', element: <CartPage /> },
          { path: 'order', element: <OrderPage /> },
          { path: 'orders', element: <OrdersPage /> },
        ],
      },
      { path: '*', element: <div className="empty-state"><h1 className="h4">Không tìm thấy trang</h1><a href="/">Về trang chủ</a></div> },
    ],
  },
];
