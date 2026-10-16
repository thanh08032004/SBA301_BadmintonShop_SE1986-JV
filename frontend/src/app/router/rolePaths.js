export const ROLE_PATHS = {
  ADMIN: "/admin",
  MANAGER: "/management",
  STAFF: "/management",
  CUSTOMER: "/",
};

export const getRoleHomePath = (roles = []) => {
  const normalizedRoles = Array.isArray(roles)
    ? roles.map((role) => role.toUpperCase())
    : [];

  if (normalizedRoles.includes("ADMIN")) {
    return ROLE_PATHS.ADMIN;
  }

  if (
    normalizedRoles.includes("MANAGER") ||
    normalizedRoles.includes("STAFF")
  ) {
    return ROLE_PATHS.MANAGER;
  }

  if (normalizedRoles.includes("CUSTOMER")) {
    return ROLE_PATHS.CUSTOMER;
  }

  return "/";
};
