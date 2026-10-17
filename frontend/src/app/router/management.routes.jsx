import ManagementLayout from "../layouts/ManagementLayout";
import ProtectedRouter from "./ProtectedRouter";
import SupportTicketManagementPage from "../../modules/support/pages/SupportTicketManagementPage";
import SupportTicketManagementDetailPage from "../../modules/support/pages/SupportTicketManagementDetailPage";
import DeliveryManagementPage from "../../modules/delivery/pages/DeliveryManagementPage";
import DeliveryManagementDetailPage from "../../modules/delivery/pages/DeliveryManagementDetailPage";
import DashboardPage from "../../modules/management/DashboardPage";
import CatalogPage from "../../modules/management/CatalogPage";
import ManagerOrdersPage from "../../modules/management/ManagerOrdersPage";


export const managementRoutes = [
  {
    element: <ProtectedRouter allowedRoles={["MANAGER", "STAFF"]} />,
    children: [
      {
        path: "/management",
        element: <ManagementLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "orders", element: <ManagerOrdersPage /> },
          { path: "catalog/:catalog", element: <CatalogPage /> },
          {
            path: "support-tickets",
            element: <SupportTicketManagementPage />,
          },
          {
            path: "support-tickets/:ticketId",
            element: <SupportTicketManagementDetailPage />,
          },
          {
            path: "deliveries",
            element: <DeliveryManagementPage />,
          },
          {
            path: "deliveries/:deliveryId",
            element: <DeliveryManagementDetailPage />,
          },
        ],
      },
    ],
  },
];
