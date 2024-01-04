import type { ROLE, USER } from "@interfaces";
import { tokenStore } from "@stores/token";
import { get } from "svelte/store";

export function isAuth(user: USER | null) {
  return !(!user || !get(tokenStore) || (new Date(get(tokenStore)!.access.expires)).getTime() < Date.now());
}

export function tokenNeedsRefresh() {
  return get(tokenStore) && (new Date(get(tokenStore)!.access.expires)).getTime() < Date.now();
}

export function isRole(user: USER | null, role: ROLE) {
  return isAuth(user) && user!.role === role;
}

export function minRole(user: USER | null, role: ROLE) {
  const roles: ROLE[] = [ 'user', 'delegate', 'admin' ];
  return isAuth(user) && roles.indexOf( user!.role ) >= roles.indexOf(role);
}