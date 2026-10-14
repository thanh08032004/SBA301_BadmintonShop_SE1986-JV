import PublicLayout from "../layouts/PublicLayout";
import Login from "../../modules/auth/pages/LoginPage";
import Register from "../../modules/auth/pages/RegisterPage";
import Payment from "../../modules/payment/pages/PaymentPage";
import QrPayment from "../../modules/payment/pages/QrPaymentPage";
import Home from "../../modules/home/pages/HomePage";

export const publicRoutes = [
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/payment", element: <Payment /> },
    { path: "/payment/qr", element: <QrPayment /> },
    {
        path: "/", element: <PublicLayout />, children: [
            { index: true, element: <Home /> }
        ]
    }
];