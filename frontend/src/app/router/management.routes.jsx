import ManagementLayout from "../layouts/ManagementLayout";
import ProtectedRouter from "./ProtectedRouter";
import SupportTicketManagementPage from "../../modules/support/pages/SupportTicketManagementPage";
import SupportTicketManagementDetailPage from "../../modules/support/pages/SupportTicketManagementDetailPage";
import { Navigate } from "react-router";

export const managementRoutes = [
  {
    element: <ProtectedRouter allowedRoles={["MANAGER", "STAFF"]} />,
    children: [
      {
        path: "/management",
        element: <ManagementLayout />,
        children: [
          { index: true, element: <Navigate to="support-tickets" replace /> },
          {
            path: "support-tickets",
            element: <SupportTicketManagementPage />,
          },
          {
            path: "support-tickets/:ticketId",
            element: <SupportTicketManagementDetailPage />,
          },
        ],
      },
    ],
  },
];
