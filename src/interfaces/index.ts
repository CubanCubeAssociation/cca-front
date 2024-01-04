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

export type Scrambler = '222so' | '333' | '333fm' | '333ni' | '333mbf' | '333oh' | '444bld' | '444wca'
  | '555wca' | '555bld' | '666wca' | '777wca' | 'clkwca' | 'mgmp' | 'pyrso' | 'skbso' | 'sqrs';

export interface CATEGORY {
  id: string;
  name: string;
  scrambler: Scrambler;
}

export interface CONTEST_CATEGORY {
  category: CATEGORY;
  rounds: number;
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

export interface ROUND {
  category: CATEGORY;
  contestant: USER;
  solves: SOLVE[];
  round: number;
  Ao5: number;
  Mo3: number;
}

export interface CONTESTANT {
  user: USER;
  categories: CATEGORY[];
  paid: boolean;
  paidAmount: number;
}

export interface ROUND {
  category: CATEGORY;
  contestant: USER;
  solves: SOLVE[];
  round: number;
  Ao5: number;
  Mo3: number;
}

export interface CONTEST {
  id: string;
  name: string;
  place: string;
  date: string;
  inscriptionStart: string;
  inscriptionEnd: string;
  inscriptionCost: number;
  categories: CONTEST_CATEGORY[];
  contestants: CONTESTANT[];
  visible: boolean;
  status: CONTEST_STATUS;
  solves: ROUND[];
  [key: string]: any;
}

export interface USER {
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