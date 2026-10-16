import AdminLayout from "../layouts/AdminLayout";
// import ProtectedRouter from "./ProtectedRouter";

export const adminRoutes = [
  {
    // element: <ProtectedRouter allowedRoles={["ADMIN", "MANAGER", "STAFF"]} />,
    // children: [
    // {
    path: "/admin",
    element: <AdminLayout />,
    children: [{ index: true, element: <>Admin</> }],
  },
  //   ]
  // }
];
