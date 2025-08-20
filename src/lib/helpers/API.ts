import ky from "ky";
import type {
  CATEGORY,
  CATEGORY_RESULT,
  CONTEST,
  CONTEST_RESULT,
  FORMAT,
  LOGIN_DATA,
  RANKING,
  USER,
  USER_PROFILE,
  USER_RESULT,
} from "@interfaces";
import { userStore } from "@stores/user";
import { get } from "svelte/store";
import { tokenNeedsRefresh } from "./auth";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { getReturnURL } from "./strings";
import { SITEMAP } from "./routing";

const debug = false;

// export const API = "http://localhost:3500/v1";
// export const API = 'http://192.168.180.93:3500/v1';
export const API = "https://cca-back.onrender.com/v1";
// export const DOMAIN = "http://localhost:5173";
export const DOMAIN = "https://cca-cuba.netlify.app";

// Common internal helper function
function commonAuth() {
  return {
    credentials: "include",
  } as const;
}

function withoutID(r: any): any {
  const res = Object.assign({}, r);
  delete res.id;

  return res;
}

// function map(obj: any, key: string, mapHandler: (...args: any[]) => any) {
//   obj[key] = obj[key].map(mapHandler);
//   return obj;
// }

// AUTH
export async function login(email: string, password: string): Promise<LOGIN_DATA | null> {
  try {
    const loginData: LOGIN_DATA = await ky
      .post(API + "/auth/login", {
        json: {
          email,
          password,
        },
        credentials: "include",
      })
      .json();

    userStore.set(loginData.user);

    return loginData;
  } catch {
    clearSessionStores();
  }

  return null;
}

export async function logout() {
  try {
    await ky
      .post(API + "/auth/logout", {
        credentials: "include",
      })
      .json();

    location.reload();
    return true;
  } catch {
    goto("/");
    return false;
  } finally {
    clearSessionStores();
    document.cookie = `access_token=; Path=/; Max-Age=0; Secure; HttpOnly`;
    document.cookie = `refresh_token=; Path=/; Max-Age=0; Secure; HttpOnly`;
  }
}

export async function refreshToken() {
  return new Promise(res => {
    if (debug) console.log("Refreshing token");

    ky.post(API + "/auth/refresh-tokens", {
      credentials: "include",
    })
      .json()
      .then(() => res(true))
      .catch(() => {
        res(false);
      });
  });
}

export function clearSessionStores() {
  userStore.set(null);
}

export function redirectToLogin() {
  clearSessionStores();
  goto(encodeURI(`${SITEMAP.login}?returnTo=${getReturnURL(get(page).url)}`));
}

export function redirectOnUnauthorized(err: { response: Response }) {
  const status = err.response.status;

  switch (status) {
    case 401:
    case 403: {
      redirectToLogin();
      break;
    }
  }
}

// CONTEST
export async function getContests(page: number, limit = 10): Promise<CONTEST_RESULT> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + `/contests?page=${page}&limit=${limit}`, commonAuth()).json();
}

export async function getContest(name: string): Promise<CONTEST> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/contests/" + name, commonAuth()).json();
}

export async function createContest(c: CONTEST): Promise<any> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky
    .post(API + "/contests", {
      json: withoutID(c),
      ...commonAuth(),
    })
    .json();
}

export async function updateContest(c: CONTEST, id: string): Promise<any> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.patch(API + "/contests/" + id, {
    json: withoutID(c),
    ...commonAuth(),
  });
}

export async function removeContest(c: CONTEST): Promise<any> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.delete(API + "/contests/" + c.id, commonAuth());
}

// USER
interface IGetUsers {
  page: number;
  limit?: number;
  name?: string;
  username?: string;
  role?: string;
  sortBy?: string;
  province?: string;
}

export async function getOwnUser(): Promise<USER | null> {
  return await ky.get(API + "/users/me", { credentials: "include" }).json();
}

export async function getUsers({
  page,
  limit = 10,
  sortBy = "name",
  province,
}: IGetUsers): Promise<USER_RESULT> {
  const params = new URLSearchParams();

  params.set("page", page + "");
  if (limit) params.set("limit", limit + "");
  if (sortBy) params.set("sortBy", sortBy);
  if (province) params.set("province", province);

  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + `/users?${params.toString()}`, commonAuth()).json();
}

export async function getUser(id: string): Promise<USER> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/users/" + id, commonAuth()).json();
}

export async function getUserByUsername(username: string): Promise<USER> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/users/username/" + username, commonAuth()).json();
}

export async function getUserProfile(username: string): Promise<USER_PROFILE> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/users/profile/" + username, commonAuth()).json();
}

export function getAvatarRoute(username: string) {
  return `${API}/users/avatar/${username}`;
}

export async function searchUser(text: string, signal?: AbortSignal): Promise<USER[]> {
  return await ky.get(API + "/users/search/" + text, { signal }).json();
}

export async function createUser(u: USER): Promise<USER> {
  if (await tokenNeedsRefresh()) await refreshToken();

  const props = [
    "email",
    "password",
    "name",
    "ci",
    "username",
    "province",
    "municipality",
    "credit",
    "avatar",
    "role",
    "sex",
  ];

  const newUser = props.reduce((acc, e) => {
    acc[e] = u[e];
    return acc;
  }, {} as any);

  return await ky
    .post(API + "/users", {
      json: newUser,
      ...commonAuth(),
    })
    .json();
}

export async function updateUser(u: USER): Promise<USER> {
  if (await tokenNeedsRefresh()) await refreshToken();

  const props = [
    "email",
    "password",
    "name",
    "ci",
    "username",
    "sex",
    "province",
    "municipality",
    "credit",
    "avatar",
    "role",
  ];

  const newUser = props.reduce((acc, e) => {
    acc[e] = u[e];
    return acc;
  }, {} as any);

  return await ky
    .patch(API + "/users/" + u.id, {
      json: newUser,
      ...commonAuth(),
    })
    .json();
}

export async function removeUser(u: USER) {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.delete(API + "/users/" + u.id, {
    ...commonAuth(),
  });
}

export async function updateAllUserProfiles() {
  return await ky
    .get(API + "/users/profile/updateAll", {
      ...commonAuth(),
    })
    .json();
}

// SOLVE

// CATEGORY
export async function getCategories(): Promise<CATEGORY_RESULT> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/categories?limit=20", commonAuth()).json();
}

export async function getCategory(id: string): Promise<CATEGORY> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/categories/" + id, commonAuth()).json();
}

export function getFormats(): FORMAT[] {
  return [
    { name: "Ao5", amount: 5, lMargin: 1, rMargin: 1 },
    { name: "Mo3", amount: 3, lMargin: 0, rMargin: 0 },
    { name: "Bo3", amount: 3, lMargin: 0, rMargin: 2 },
    { name: "Bo2", amount: 2, lMargin: 0, rMargin: 1 },
    { name: "Bo1", amount: 1, lMargin: 0, rMargin: 0 },
  ];
  // if (await tokenNeedsRefresh()) await refreshToken();
  // return await ky.get(API + "/categories/formats", commonAuth()).json();
}

export async function createCategory(c: CATEGORY) {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.post(API + "/categories", {
    json: withoutID(c),
    ...commonAuth(),
  });
}

export async function updateCategory(c: CATEGORY) {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.patch(API + "/categories/" + c.id, {
    json: withoutID(c),
    ...commonAuth(),
  });
}

export async function removeCategory(c: CATEGORY) {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky.delete(API + "/categories/" + c.id, {
    ...commonAuth(),
  });
}

// RESULTS
export async function getResults() {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await ky
    .get(API + "/results/", {
      ...commonAuth(),
    })
    .json();
}

export async function updateResults() {
  if (await tokenNeedsRefresh()) await refreshToken();

  return await ky
    .get(API + "/results/update", {
      ...commonAuth(),
    })
    .json();
}

export async function updateAll() {
  if (await tokenNeedsRefresh()) await refreshToken();

  return await ky
    .get(API + "/results/updateAll", {
      ...commonAuth(),
    })
    .json();
}

export async function getRanking(category: string, type: "Single" | "Media"): Promise<RANKING[]> {
  if (await tokenNeedsRefresh()) await refreshToken();

  return await ky
    .get(API + `/results/ranking/${category}/${type}`, {
      ...commonAuth(),
      timeout: false,
    })
    .json();
}

export async function updateRanking(
  category: string,
  type: "Single" | "Media"
): Promise<RANKING[]> {
  if (await tokenNeedsRefresh()) await refreshToken();

  return await ky
    .get(API + `/results/ranking/${category}/${type}/update`, {
      ...commonAuth(),
    })
    .json();
}

export async function updateRankings(): Promise<boolean> {
  if (await tokenNeedsRefresh()) await refreshToken();

  return await ky
    .get(API + `/results/ranking/update`, {
      ...commonAuth(),
    })
    .json();
}

export async function dumpData(): Promise<any> {
  if (await tokenNeedsRefresh()) await refreshToken();

  return await ky
    .get(API + `/results/dumpData`, {
      ...commonAuth(),
    })
    .json();
}
