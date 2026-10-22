import { ROLES } from '@/shared/constants/roles';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '@/app/layouts/admin/AdminLayout';
import AccountsPage from '@/modules/admin/pages/AccountsPage';

export const adminRoutes = [
  {
    element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [{ index: true, element: <AccountsPage /> }],
      },
    ],
  },
];
