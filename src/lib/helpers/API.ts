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
import { tokenStore } from "@stores/token";
import { userStore } from "@stores/user";
import { API } from "@constants";
import { get } from "svelte/store";
import { tokenNeedsRefresh } from "./auth";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { getReturnURL } from "./strings";

const debug = false;

// Common internal helper function
function getAuth(): string {
  const tokens = get(tokenStore);
  return "Bearer " + (tokens?.access.token || "");
}

function getRefreshToken(): string {
  const tokens = get(tokenStore);
  return tokens?.refresh.token || "";
}

function commonAuth() {
  if (!get(tokenStore)) return {};

  return {
    headers: {
      Authorization: getAuth(),
    },
  };
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
      })
      .json();

    userStore.set(loginData.user);
    tokenStore.set(loginData.tokens);

    // document.cookie = `access_token=${loginData.tokens.access.token}; Path=/; Secure; HttpOnly`;
    // document.cookie = `refresh_token=${loginData.tokens.refresh.token}; Path=/; Secure; HttpOnly`;

    localStorage.setItem("user", JSON.stringify(loginData.user));
    localStorage.setItem("tokens", JSON.stringify(loginData.tokens));

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
        json: {
          refreshToken: getRefreshToken(),
        },
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
  if (debug) console.log("STORES: ", get(userStore), get(tokenStore));

  if (!get(userStore) || !get(tokenStore)) return false;

  if (debug) console.log("Refreshing token");

  try {
    const tokens: LOGIN_DATA["tokens"] = await ky
      .post(API + "/auth/refresh-tokens", {
        json: { refreshToken: getRefreshToken() },
      })
      .json();

    if (debug) console.log("TOKENS: ", tokens);

    tokenStore.set(tokens);
    localStorage.setItem("user", JSON.stringify(get(userStore)));
    localStorage.setItem("tokens", JSON.stringify(tokens));
    return true;
  } catch (err) {
    console.log("ERROR: ", err);
  }

  return false;
}

export function clearSessionStores() {
  userStore.set(null);
  tokenStore.set(null);
  localStorage.removeItem("tokens");
  localStorage.removeItem("user");
}

export function redirectToLogin() {
  clearSessionStores();
  goto(encodeURI(`/login?returnTo=${getReturnURL(get(page).url)}`));
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
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + `/contests?page=${page}&limit=${limit}`, commonAuth()).json();
}

export async function getContest(name: string): Promise<CONTEST> {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/contests/" + name, commonAuth()).json();
}

export async function createContest(c: CONTEST): Promise<any> {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky
    .post(API + "/contests", {
      json: withoutID(c),
      ...commonAuth(),
    })
    .json();
}

export async function updateContest(c: CONTEST, id: string): Promise<any> {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.patch(API + "/contests/" + id, {
    json: withoutID(c),
    ...commonAuth(),
  });
}

export async function removeContest(c: CONTEST): Promise<any> {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.delete(API + "/contests/" + c.id, commonAuth());
}

// USER
export async function getUsers(page: number, limit = 10): Promise<USER_RESULT> {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + `/users?page=${page}&limit=${limit}`, commonAuth()).json();
}

export async function getUser(id: string): Promise<USER> {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/users/" + id, commonAuth()).json();
}

export async function getUserByUsername(username: string): Promise<USER> {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/users/username/" + username, commonAuth()).json();
}

export async function getUserProfile(username: string): Promise<USER_PROFILE> {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/users/profile/" + username, commonAuth()).json();
}

export function getAvatarRoute(username: string) {
  return `${API}/users/avatar/${username}`;
}

export async function searchUser(text: string, signal?: AbortSignal): Promise<USER[]> {
  return await ky.get(API + "/users/search/" + text, { signal }).json();
}

export async function createUser(u: USER) {
  if (tokenNeedsRefresh()) await refreshToken();

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

  return await ky.post(API + "/users", {
    json: newUser,
    ...commonAuth(),
  });
}

export async function updateUser(u: USER) {
  if (tokenNeedsRefresh()) await refreshToken();

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

  return await ky.patch(API + "/users/" + u.id, {
    json: newUser,
    ...commonAuth(),
  });
}

export async function removeUser(u: USER) {
  if (tokenNeedsRefresh()) await refreshToken();
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
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/categories?limit=20", commonAuth()).json();
}

export async function getCategory(id: string): Promise<CATEGORY> {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/categories/" + id, commonAuth()).json();
}

export async function getFormats(): Promise<FORMAT[]> {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.get(API + "/categories/formats", commonAuth()).json();
}

export async function createCategory(c: CATEGORY) {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.post(API + "/categories", {
    json: withoutID(c),
    ...commonAuth(),
  });
}

export async function updateCategory(c: CATEGORY) {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.patch(API + "/categories/" + c.id, {
    json: withoutID(c),
    ...commonAuth(),
  });
}

export async function removeCategory(c: CATEGORY) {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky.delete(API + "/categories/" + c.id, {
    ...commonAuth(),
  });
}

// RESULTS
export async function getResults() {
  if (tokenNeedsRefresh()) await refreshToken();
  return await ky
    .get(API + "/results/", {
      ...commonAuth(),
    })
    .json();
}

export async function updateResults() {
  if (tokenNeedsRefresh()) await refreshToken();

  return await ky
    .get(API + "/results/update", {
      ...commonAuth(),
    })
    .json();
}

export async function getRanking(category: string, type: "Single" | "Media"): Promise<RANKING[]> {
  if (tokenNeedsRefresh()) await refreshToken();

  return await ky
    .get(API + `/results/ranking/${category}/${type}`, {
      ...commonAuth(),
    })
    .json();
}

export async function updateRanking(
  category: string,
  type: "Single" | "Media"
): Promise<RANKING[]> {
  if (tokenNeedsRefresh()) await refreshToken();

  return await ky
    .get(API + `/results/ranking/${category}/${type}/update`, {
      ...commonAuth(),
    })
    .json();
}

export async function updateRankings(): Promise<boolean> {
  if (tokenNeedsRefresh()) await refreshToken();

  return await ky
    .get(API + `/results/ranking/update`, {
      ...commonAuth(),
    })
    .json();
}
