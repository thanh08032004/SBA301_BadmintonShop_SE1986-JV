export const ROLE_PATHS = {
  ADMIN: "/admin",
  MANAGER: "/admin",
  STAFF: "/admin",
  CUSTOMER: "/",
};

export const getRoleHomePath = (roles = []) => {
  const normalizedRoles = Array.isArray(roles)
    ? roles.map((role) => role.toUpperCase())
    : [];

  if (
    normalizedRoles.includes("ADMIN") ||
    normalizedRoles.includes("MANAGER") ||
    normalizedRoles.includes("STAFF")
  ) {
    return ROLE_PATHS.ADMIN;
  }

  if (normalizedRoles.includes("CUSTOMER")) {
    return ROLE_PATHS.CUSTOMER;
  }

  return "/";
};
