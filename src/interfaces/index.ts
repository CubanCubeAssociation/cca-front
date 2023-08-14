export type ROLE = 'user' | 'delegate' | 'admin';
export type SEX = 'M' | 'F';

export interface USER {
  id: string;
  name: string;
  email: string;
  password: string;
  ci: string;
  sex: SEX;
  username: string;
  province: string;
  municipality: string;
  credit: number;
  avatar: string;
  role: ROLE;
  isEmailVerified: boolean;
  age: number;
  [key: string]: any;
}

export interface TOKEN {
  expires: string;
  token: string;
}

export interface TOKENS {
  access: TOKEN;
  refresh: TOKEN;
}

export interface LOGIN_DATA {
  user: USER;
  tokens: TOKENS;
}

export interface CATEGORY {
  id: string;
  name: string;
  icon: string;
  scrambler: string;
}

export enum PENALTY {
  NONE = '00',
  DNS = '01',
  P2 = '10',
  DNF = '11',
}

export interface SOLVE {
  id: string;
  contest: CONTEST;
  category: CATEGORY;
  user: USER;
  scrambler: USER;
  judge: USER;
  round: number;
  reconstruction: string;
  time: string;
  solve: number;
  isExtra: boolean;
  extra: number;
  penaltyType: PENALTY;
  penaltyDetails: string;
}

export type CONTEST_STATUS = 'pending' | 'inscription' | 'running' | 'results' | 'finished';

export const STATUS_ORDER: CONTEST_STATUS[] = [
  'pending', 'inscription', 'running', 'results', 'finished'
];

export interface CONTESTANT {
  user: USER;
  categories: CATEGORY[];
}

export interface CONTEST {
  id: string;
  name: string;
  place: string;
  date: string;
  inscriptionStart: string;
  inscriptionEnd: string;
  inscriptionCost: number;
  categories: CATEGORY[];
  contestants: CONTESTANT[];
  visible: boolean;
  status: CONTEST_STATUS;
  paidUsers: USER[];
  solves: SOLVE[];
  [key: string]: any;
}

export interface CONTEST_RESULT {
  limit: number;
  page: number;
  results: CONTEST[];
  totalPages: number;
  totalResults: number;
}

export interface CATEGORY_RESULT {
  limit: number;
  page: number;
  results: CATEGORY[];
  totalPages: number;
  totalResults: number;
}

export interface USER_RESULT {
  limit: number;
  page: number;
  results: USER[];
  totalPages: number;
  totalResults: number;
}

export interface PROVINCE {
  id: string;
  nombre: string;
  municipios: string[];
}