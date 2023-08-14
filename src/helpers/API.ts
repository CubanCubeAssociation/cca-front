import ky from 'ky';
import type { CATEGORY, CATEGORY_RESULT, CONTEST, CONTEST_RESULT, LOGIN_DATA, TOKENS, USER, USER_RESULT } from '../interfaces';
import { tokenStore } from '../stores/token';
import { userStore } from '../stores/user';
import { API } from '../constants';

// Common internal helper function
function getAuth(): string {
  let tokens: TOKENS = JSON.parse( localStorage.getItem('tokens') || '{}' );
  return 'Bearer ' + tokens.access?.token;
}

function commonAuth() {
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

// AUTH
export async function login(email: string, password: string): Promise<LOGIN_DATA> {
  let loginData: LOGIN_DATA = await ky.post(API + '/auth/login', {
    json: {
      email, password
    }
  }).json();

  userStore.set( loginData.user );
  tokenStore.set( loginData.tokens );

  localStorage.setItem('user', JSON.stringify(loginData.user));
  localStorage.setItem('tokens', JSON.stringify(loginData.tokens));
  
  return loginData;
}

// CONTEST
export async function getContests(): Promise<CONTEST_RESULT> {
  return await ky.get(API + '/contests', commonAuth()).json();
}

export async function getContest(name: string): Promise<CONTEST> {
  return await ky.get(API + '/contests/' + name, commonAuth()).json();
}

export async function createContest(c: CONTEST): Promise<any> {
  return await ky.post(API + '/contests', {
    json: withoutID(c), ...commonAuth()
  }).json();
}

export async function updateContest(c: CONTEST): Promise<any> {
  return await ky.patch(API + '/contests/' + c.id, {
    json: withoutID(c), ...commonAuth()
  });
}

export async function removeContest(c: CONTEST): Promise<any> {
  return await ky.delete(API + '/contests/' + c.id, commonAuth());
}

// USER
export async function getUsers(): Promise<USER_RESULT> {
  return await ky.get(API + '/users', commonAuth()).json();
}

export async function getUser(id: string): Promise<USER> {
  return await ky.get(API + '/users/' + id, commonAuth()).json();
}

export async function searchUser(text: string, signal?: AbortSignal): Promise<USER[]> {
  return await ky.get(API + '/users/search/' + text, { signal }).json();
}

export async function createUser(u: USER) {
  return await ky.post(API + '/users', {
    json: withoutID(u), ...commonAuth()
  });
}

export async function updateUser(u: USER) {
  const props = [
    "email", "password", "name", "ci", "username",
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
  return await ky.delete(API + '/categories/' + u.id, {
    ...commonAuth()
  });
}

// SOLVE

// CATEGORY
export async function getCategories(): Promise<CATEGORY_RESULT> {
  return await ky.get(API + '/categories?limit=20', commonAuth()).json();
}

export async function getCategory(id: string): Promise<CATEGORY> {
  return await ky.get(API + '/categories/' + id, commonAuth()).json();
}

export async function createCategory(c: CATEGORY) {
  return await ky.post(API + '/categories', {
    json: withoutID(c),
    ...commonAuth()
  });
}

export async function updateCategory(c: CATEGORY) {
  return await ky.patch(API + '/categories/' + c.id, {
    json: withoutID(c), ...commonAuth()
  });
}

export async function removeCategory(c: CATEGORY) {
  return await ky.delete(API + '/categories/' + c.id, {
    ...commonAuth()
  });
}