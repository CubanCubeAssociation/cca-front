import { ROLES } from "@constants";
import type { ROLE, USER } from "@interfaces";

export async function tokenNeedsRefresh() {
  return !!cookieStore.get("accessToken");
}

export function isRole(user: USER | null, role: ROLE) {
  return !!user && user.role === role;
}

export function minRole(user: USER | null, role: ROLE) {
  const roles = ROLES.map(r => r.value);
  return user && roles.indexOf(user.role) <= roles.indexOf(role);
}
