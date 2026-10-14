import PublicLayout from "../layouts/PublicLayout";
import Login from "../../modules/auth/pages/LoginPage";
import Register from "../../modules/auth/pages/RegisterPage";
import Checkout from "../../modules/payment/pages/CheckoutPage";
import QrPayment from "../../modules/payment/pages/QrPaymentPage";
import PaymentResult from "../../modules/payment/pages/PaymentResultPage";
import Home from "../../modules/home/pages/HomePage";

export const publicRoutes = [
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/payment", element: <Checkout /> },
    { path: "/payment/qr", element: <QrPayment /> },
    { path: "/payment/result", element: <PaymentResult /> },
    {
        path: "/", element: <PublicLayout />, children: [
            { index: true, element: <Home /> }
        ]
    }
];