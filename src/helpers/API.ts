import ky from 'ky';
import type { CATEGORY, CATEGORY_RESULT, CONTEST, CONTEST_RESULT, LOGIN_DATA, TOKENS, USER, USER_RESULT } from '../interfaces';
import { tokenStore } from '../stores/token';
import { userStore } from '../stores/user';
import { API } from '../constants';
import { get } from 'svelte/store';
import { tokenNeedsRefresh } from './auth';

// Common internal helper function
function getAuth(): string {
  let tokens = get(tokenStore);
  return 'Bearer ' + (tokens?.access.token || '');
}

function getRefreshToken(): string {
  let tokens = get(tokenStore);
  return tokens?.refresh.token || '';
}

function commonAuth() {
  if ( !get(tokenStore) ) return {};

  return {
    headers: {
      Authorization: getAuth()
    }
  };
}

function withoutID(r: any): any {
  let res = Object.assign({}, r);
  delete res.id;

  return res;
}

function map(obj: any, key: string, mapHandler: (...args: any[]) => any) {
  obj[key] = obj[key].map(mapHandler);
  return obj;
}

// AUTH
export async function login(email: string, password: string): Promise<LOGIN_DATA | null> {
  try {
    let loginData: LOGIN_DATA = await ky.post(API + '/auth/login', {
      json: {
        email, password
      }
    }).json();
  
    userStore.set(loginData.user);
    tokenStore.set(loginData.tokens);
  
    localStorage.setItem('user', JSON.stringify(loginData.user));
    localStorage.setItem('tokens', JSON.stringify(loginData.tokens));
  
    return loginData;
  } catch {
    userStore.set(null);
    tokenStore.set(null);
  }

  return null;
}

export async function refreshToken() {
  console.log("STORES: ", get(userStore), get(tokenStore));
  
  if ( !get(userStore) || !get(tokenStore) ) return false;

  console.log("Refreshing token");

  try {
    let tokens: LOGIN_DATA['tokens'] = await ky.post(API + '/auth/refresh-tokens', {
      json: { refreshToken: getRefreshToken() }
    }).json();
  
    console.log("TOKENS: ", tokens);
  
    tokenStore.set(tokens);
    localStorage.setItem('tokens', JSON.stringify(tokens));
    return true;
  } catch{}

  return false;
}

// CONTEST
export async function getContests(): Promise<CONTEST_RESULT> {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  return await ky.get(API + '/contests', commonAuth()).json();
}

export async function getContest(name: string): Promise<CONTEST> {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  return await ky.get(API + '/contests/' + name, commonAuth()).json();
}

export async function createContest(c: CONTEST): Promise<any> {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  console.log("CONTEST: ", c);

  return await ky.post(API + '/contests', {
    json: withoutID(c), ...commonAuth()
  }).json();
}

export async function updateContest(c: CONTEST, id: string): Promise<any> {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  console.log("CONTEST: ", c);

  return await ky.patch(API + '/contests/' + id, {
    json: withoutID(c), ...commonAuth()
  });
}

export async function removeContest(c: CONTEST): Promise<any> {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  return await ky.delete(API + '/contests/' + c.id, commonAuth());
}

// USER
export async function getUsers(): Promise<USER_RESULT> {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  return await ky.get(API + '/users', commonAuth()).json();
}

export async function getUser(id: string): Promise<USER> {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }
  
  return await ky.get(API + '/users/' + id, commonAuth()).json();
}

export async function searchUser(text: string, signal?: AbortSignal): Promise<USER[]> {
  return await ky.get(API + '/users/search/' + text, { signal }).json();
}

export async function createUser(u: USER) {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  const props = [
    "email", "password", "name", "ci", "username",
    "province", "municipality", "credit", "avatar", "role", "sex"
  ];

  const newUser = props.reduce((acc, e) => {
    acc[e] = u[e];
    return acc;
  }, {} as any);

  return await ky.post(API + '/users', {
    json: newUser, ...commonAuth()
  });
}

export async function updateUser(u: USER) {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  const props = [
    "email", "password", "name", "ci", "username", "sex",
    "province", "municipality", "credit", "avatar", "role"
  ];

  const newUser = props.reduce((acc, e) => {
    acc[e] = u[e];
    return acc;
  }, {} as any);

  return await ky.patch(API + '/users/' + u.id, {
    json: newUser, ...commonAuth()
  });
}

export async function removeUser(u: USER) {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  return await ky.delete(API + '/users/' + u.id, {
    ...commonAuth()
  });
}

// SOLVE

// CATEGORY
export async function getCategories(): Promise<CATEGORY_RESULT> {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  return await ky.get(API + '/categories?limit=20', commonAuth()).json();
}

export async function getCategory(id: string): Promise<CATEGORY> {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  return await ky.get(API + '/categories/' + id, commonAuth()).json();
}

export async function createCategory(c: CATEGORY) {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  return await ky.post(API + '/categories', {
    json: withoutID(c),
    ...commonAuth()
  });
}

export async function updateCategory(c: CATEGORY) {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  return await ky.patch(API + '/categories/' + c.id, {
    json: withoutID(c), ...commonAuth()
  });
}

export async function removeCategory(c: CATEGORY) {
  if ( tokenNeedsRefresh() ) {
    await refreshToken();
  }

  return await ky.delete(API + '/categories/' + c.id, {
    ...commonAuth()
  });
}