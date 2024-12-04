export type ROLE = "user" | "delegate" | "admin" | "root";
export type SEX = "M" | "F";

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

export type Scrambler =
  | "222so"
  | "333"
  | "333fm"
  | "333ni"
  | "333mbf"
  | "333oh"
  | "444bld"
  | "444wca"
  | "555wca"
  | "555bld"
  | "666wca"
  | "777wca"
  | "clkwca"
  | "mgmp"
  | "pyrso"
  | "skbso"
  | "sqrs";

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
  NONE = "00",
  DNS = "01",
  P2 = "10",
  DNF = "11",
}

export interface SOLVE {
  isExtra: boolean;
  extra: number;
  reconstruction: string;
  time: string;
  penaltyType: PENALTY;
  penaltyDetails: string;
}

export interface ROUND {
  category: CATEGORY;
  contestant: USER;
  t1: SOLVE;
  t2: SOLVE;
  t3: SOLVE;
  t4: SOLVE;
  t5: SOLVE;
  e1: SOLVE;
  e2: SOLVE;
  round: number;
  average: number;
  id: string;
}

export interface CONTESTANT {
  user: USER;
  categories: CATEGORY[];
  paid: boolean;
  paidAmount: number;
}

export type CONTEST_STATUS = "pending" | "inscription" | "running" | "results" | "finished";

export const STATUS_ORDER: CONTEST_STATUS[] = [
  "pending",
  "inscription",
  "running",
  "results",
  "finished",
];

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
  rounds: ROUND[];
}

export interface RANKING {
  contestant: {
    name: string;
    username: string;
    role: ROLE;
  };
  contest: string;
  time: number;
}

export interface PAGINATION_RESULT {
  limit: number;
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface CONTEST_RESULT extends PAGINATION_RESULT {
  results: CONTEST[];
}

export interface CATEGORY_RESULT extends PAGINATION_RESULT {
  results: CATEGORY[];
}

export interface USER_RESULT extends PAGINATION_RESULT {
  results: USER[];
}

export interface PROVINCE {
  id: string;
  nombre: string;
  municipios: string[];
}

export type Alignment = "start" | "end";
export type Side = "top" | "right" | "bottom" | "left";
export type AlignedPlacement = `${Side}-${Alignment}`;
export type Placement = Side | AlignedPlacement;

export type IColor =
  | "gray"
  | "red"
  | "yellow"
  | "green"
  | "purple"
  | "blue"
  | "primary"
  | undefined;

export type INotColor =
  | "red"
  | "yellow"
  | "green"
  | "purple"
  | "blue"
  | "primary"
  | "light"
  | "dark"
  | "none"
  | "alternative";

export interface NotificationAction {
  text: string;
  color?: INotColor;
  callback: (e: MouseEvent) => void;
}

export interface INotification {
  key?: string;
  header: string;
  text: string;
  icon?: any;
  html?: string;
  fixed?: boolean;
  timeout?: number;
  actions?: NotificationAction[];
}

interface USER_PROFILE_CONTEST {
  round: number;
  category: CATEGORY;
  contestName: string;
  average: number;
  times: number[];
}

interface USER_PROFILE_RESULT {
  place: number;
  amount: number;
  points: number;
  contests: USER_PROFILE_CONTEST[];
}

interface USER_RECORD_RESULT {
  type: "media" | "single";
  category: string;
  time: number;
  contest: string;
}

interface USER_RECORD {
  nr: {
    results: USER_RECORD_RESULT[];
    points: number;
  };
  pr: {
    results: USER_RECORD_RESULT[];
    points: number;
  };
  wr: {
    results: USER_RECORD_RESULT[];
    points: number;
  };
}

export interface USER_PROFILE {
  user: USER;
  results: USER_PROFILE_RESULT[];
  records: USER_RECORD;
  contests: { name: string; date: Date }[];
  totalContests: number;
}
