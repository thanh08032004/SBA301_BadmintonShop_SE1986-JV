import ProtectedRouter from "./ProtectedRouter";
import AdminLayout from "../layouts/AdminLayout";
import AccountsPage from "../../modules/admin/pages/AccountsPage";

export const adminRoutes = [
  {
    element: <ProtectedRouter allowedRoles={["ADMIN"]} />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AccountsPage /> },
        ],
      },
    ],
  },
];
