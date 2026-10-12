import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { AuthsContext } from "../provider/AuthsContext";
import { getRoleHomePath } from "./rolePaths";

const ProtectedRouter = ({ allowedRoles }) => {
  const { user } = useContext(AuthsContext);

  const location = useLocation();

  const token = user?.authToken || user?.token || null;
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((role) => role.toUpperCase())
    : [];

  const isAuthenticated =
    typeof token === "string" && token.trim() !== "";

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: "Please log in to access this page.",
        }}
        replace
      />
    );
  }

  if (allowedRoles?.length > 0) {
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      role.toUpperCase(),
    );
    const hasPermission = normalizedAllowedRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasPermission) {
      return <Navigate to={getRoleHomePath(userRoles) || "/"} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRouter;
