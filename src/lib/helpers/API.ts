import ky from "ky";
import type {
  CATEGORY,
  CATEGORY_RESULT,
  CONTEST,
  CONTEST_CATEGORY,
  CONTEST_RESULT,
  FORMAT,
  LOGIN_DATA,
  RANKING,
  USER,
  USER_PROFILE,
  USER_RESULT,
} from "@interfaces";
import { userStore } from "@stores/user";
import { tokenNeedsRefresh } from "./auth";
import { goto } from "$app/navigation";
import { getReturnURL } from "./strings";
import { SITEMAP } from "./routing";
import { page } from "$app/state";

export const DOMAIN = "https://cca-cuba.netlify.app";

const API_URL = "https://cca-back.onrender.com/v1";
// const API_URL = "http://localhost:3500/v1";
// const API_URL = "http://172.20.10.5:3500/v1";
const API = ky.create({
  prefixUrl: API_URL,
  credentials: "include",
  hooks: {
    beforeRequest: [
      request => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
  },
});

function withoutID(r: any): any {
  const res = Object.assign({}, r);
  delete res.id;

  return res;
}

// AUTH
export async function login(email: string, password: string): Promise<LOGIN_DATA | null> {
  try {
    const loginData: LOGIN_DATA = await API.post("auth/login", {
      json: {
        email,
        password,
      },
    }).json();

    userStore.set(loginData.user);
    localStorage.setItem("accessToken", loginData.tokens.access.token);
    localStorage.setItem(
      "accessTokenExpiry",
      new Date(loginData.tokens.access.expires).getTime().toString()
    );

    return loginData;
  } catch {
    clearSessionStores();
  }

  return null;
}

export async function logout() {
  try {
    await API.post("auth/logout").json();
    location.reload();
    return true;
  } catch {
    goto("/");
    return false;
  } finally {
    clearSessionStores();
  }
}

async function refreshToken() {
  return API.post("auth/refresh-tokens")
    .json()
    .then((data: any) => {
      if (!data?.access?.token) throw new Error("No token in refresh");

      localStorage.setItem("accessToken", data.access.token);
      localStorage.setItem("accessTokenExpiry", new Date(data.access.expires).getTime().toString());

      return true;
    })
    .catch(() => false);
}

export function clearSessionStores() {
  userStore.set(null);
  localStorage.removeItem("accessToken");
  localStorage.removeItem("accessTokenExpiry");
}

export function redirectToLogin() {
  clearSessionStores();
  goto(encodeURI(`${SITEMAP.login}?returnTo=${getReturnURL(page.url)}`));
}

export function redirectOnUnauthorized(err: { response: Response }) {
  if (!err || !err.response) return;

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
  return await API.get(`contests?page=${page}&limit=${limit}`).json();
}

export async function getContest(name: string): Promise<CONTEST> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.get("contests/" + name).json();
}

export async function createContest(c: CONTEST): Promise<any> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.post("contests", {
    json: withoutID(c),
  }).json();
}

export async function updateContest(c: CONTEST, id: string): Promise<any> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.patch("contests/" + id, {
    json: withoutID(c),
  });
}

export async function removeContest(c: CONTEST): Promise<any> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.delete("contests/" + c.id);
}

export async function inscribeContestUser(
  c: CONTEST,
  u: USER,
  ct: CONTEST_CATEGORY[]
): Promise<boolean> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.post(`contests/${c.id}/inscribe/${u.id}`, {
    json: {
      categories: ct.map(category => category.category.id),
    },
  }).json();
}

export async function removeContestUser(c: CONTEST, u: USER): Promise<boolean> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.post(`contests/${c.id}/remove/${u.id}`).json();
}

export async function modifyUserContest(
  contestId: string,
  userId: string,
  ct: CONTEST_CATEGORY[]
): Promise<boolean> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.post(`contests/${contestId}/modify/${userId}`, {
    json: {
      categories: ct.map(category => category.category.id),
    },
  }).json();
}

export async function generateScrambles(contestId: string): Promise<CONTEST> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.post(`contests/${contestId}/generateScrambles`, {
    timeout: 60000,
  }).json();
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

export async function getOwnUser() {
  return API.get("users/me")
    .json()
    .then((user: any) => {
      userStore.set(user);
      return user;
    })
    .catch(err => {
      if (err.name !== "TimeoutError") {
        clearSessionStores();
      }
      return null;
    });
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

  return await API.get(`users?${params.toString()}`).json();
}

export async function getUser(id: string): Promise<USER> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.get("users/" + id).json();
}

export async function getUserByUsername(username: string): Promise<USER> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.get("users/username/" + username).json();
}

export async function getUserProfile(username: string): Promise<USER_PROFILE> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.get("users/profile/" + username).json();
}

export function getAvatarRoute(username: string) {
  return `${API_URL}/users/avatar/${username}`;
}

export async function searchUser(text: string, signal?: AbortSignal): Promise<USER[]> {
  return await API.get("users/search/" + text, { signal }).json();
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

  return await API.post("users", {
    json: newUser,
  }).json();
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

  return await API.patch("users/" + u.id, {
    json: newUser,
  }).json();
}

export async function removeUser(u: USER) {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.delete("users/" + u.id);
}

export async function updateAllUserProfiles() {
  return await API.get("users/profile/updateAll").json();
}

// SOLVE

// CATEGORY
export async function getCategories(): Promise<CATEGORY_RESULT> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.get("categories?limit=20").json();
}

export async function getCategory(id: string): Promise<CATEGORY> {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.get("categories/" + id).json();
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
  // return await API.get("categories/formats").json();
}

export async function createCategory(c: CATEGORY) {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.post("categories", {
    json: withoutID(c),
  });
}

export async function updateCategory(c: CATEGORY) {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.patch("categories/" + c.id, {
    json: withoutID(c),
  });
}

export async function removeCategory(c: CATEGORY) {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.delete("categories/" + c.id);
}

// RESULTS
export async function getResults() {
  if (await tokenNeedsRefresh()) await refreshToken();
  return await API.get("results/").json();
}

export async function updateResults() {
  if (await tokenNeedsRefresh()) await refreshToken();

  return await API.get("results/update").json();
}

export async function updateAll() {
  if (await tokenNeedsRefresh()) await refreshToken();

  return await API.get("results/updateAll", { timeout: 60000 }).json();
}

export async function getRanking(
  category: string,
  type: "Single" | "Media",
  province?: string,
  sex?: string
): Promise<RANKING[]> {
  if (await tokenNeedsRefresh()) await refreshToken();

  const query = new URLSearchParams();

  if (province) query.set("province", province);
  if (sex) query.set("sex", sex);

  return await API.get(`results/ranking/${category}/${type}?${query.toString()}`, {
    timeout: false,
  }).json();
}

export async function updateRanking(
  category: string,
  type: "Single" | "Media"
): Promise<RANKING[]> {
  if (await tokenNeedsRefresh()) await refreshToken();

  return await API.get(`results/ranking/${category}/${type}/update`).json();
}

export async function updateRankings(): Promise<boolean> {
  if (await tokenNeedsRefresh()) await refreshToken();

  return await API.get(`results/ranking/update`).json();
}

export async function dumpData(): Promise<any> {
  if (await tokenNeedsRefresh()) await refreshToken();

  return await API.get(`results/dumpData`).json();
}
