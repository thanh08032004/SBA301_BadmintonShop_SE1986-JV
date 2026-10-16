import ProtectedRouter from "./ProtectedRouter";
import PublicLayout from "../layouts/PublicLayout";
import Login from "../../modules/auth/pages/LoginPage";
import Register from "../../modules/auth/pages/RegisterPage";
import Checkout from "../../modules/payment/pages/CheckoutPage";
import QrPayment from "../../modules/payment/pages/QrPaymentPage";
import PaymentResult from "../../modules/payment/pages/PaymentResultPage";
import Home from "../../modules/home/pages/HomePage";

import CartPage from "../../modules/shop/CartPage";
import OrderPage from "../../modules/shop/OrderPage";
import OrdersPage from "../../modules/shop/OrdersPage";
import MySupportTicketsPage from "../../modules/support/pages/MySupportTicketsPage";
import CreateSupportTicketPage from "../../modules/support/pages/CreateSupportTicketPage";
import SupportTicketDetailPage from "../../modules/support/pages/SupportTicketDetailPage";
import { Navigate } from "react-router";
export const publicRoutes = [
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    {
        path: "/",
        element: <PublicLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "products", element: <Home catalog /> },
            {
                element: <ProtectedRouter />,
                children: [
                    { path: "cart", element: <CartPage /> },
                    { path: "order", element: <OrderPage /> },
                    { path: "orders", element: <OrdersPage /> },
                    { path: "support-tickets", element: <MySupportTicketsPage /> },
                    { path: "support-tickets/create", element: <CreateSupportTicketPage /> },
                    { path: "support-tickets/:ticketId", element: <SupportTicketDetailPage /> },
                    { path: "my-requests", element: <Navigate to="/support-tickets" replace /> },
                    { path: "my-requests/create", element: <Navigate to="/support-tickets/create" replace /> },
                    { path: "/payments", element: <Checkout /> },
                    { path: "/payments/qr", element: <QrPayment /> },
                    { path: "/payments/result", element: <PaymentResult /> },
                ],
            },
            {
                path: "*",
                element: (
                    <div className="empty-state">
                        <h1 className="h4">Không tìm thấy trang</h1>
                        <a href="/">Về trang chủ</a>
                    </div>
                ),
            },
        ],
    },
];
