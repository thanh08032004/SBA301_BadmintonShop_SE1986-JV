import { ROLES } from '@/shared/constants/roles';

export const ROLE_HOME_PATHS = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.MANAGER]: '/management',
  [ROLES.STAFF]: '/management',
  [ROLES.CUSTOMER]: '/',
};

// Home page after login: ADMIN first, then MANAGER/STAFF, otherwise the store.
export function getRoleHomePath(roles = []) {
  const normalized = Array.isArray(roles) ? roles.map((role) => role.toUpperCase()) : [];
  const role = [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF].find((item) => normalized.includes(item));
  return ROLE_HOME_PATHS[role] || '/';
}
