import ProtectedRouter from "./ProtectedRouter";

export const adminRoutes = [
  {
    element: <ProtectedRouter allowedRoles={["ADMIN"]} />,
    children: [
      {
        path: "/admin",
        element: (
          <main className="p-4">
            <div className="eyebrow">QUẢN TRỊ HỆ THỐNG</div>
            <h1 className="h2 fw-bold">Admin</h1>
          </main>
        ),
      },
    ],
  },
];
