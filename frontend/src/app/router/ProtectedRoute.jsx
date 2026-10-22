import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/app/providers/auth/AuthContext';
import { getRoles, getToken } from '@/shared/auth/session';
import { getRoleHomePath } from '@/shared/auth/rolePaths';

// Requires a logged-in user; when allowedRoles is given, the user needs at least one of them.
export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!getToken(user)?.trim()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, message: 'Vui lòng đăng nhập để sử dụng chức năng này.' }}
      />
    );
  }

  const userRoles = getRoles(user);
  const hasPermission =
    !allowedRoles?.length || allowedRoles.some((role) => userRoles.includes(role.toUpperCase()));

  return hasPermission ? <Outlet /> : <Navigate to={getRoleHomePath(userRoles)} replace />;
}
