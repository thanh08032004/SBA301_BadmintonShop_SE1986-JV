import PublicLayout from "../layouts/PublicLayout";
import Login from "../../modules/auth/pages/LoginPage";
import Register from "../../modules/auth/pages/RegisterPage";

export const publicRoutes = [
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    {
        path: "/", element: <PublicLayout />, children: [
            { index: true, element: <>Home Page</> }
        ]
    }
];