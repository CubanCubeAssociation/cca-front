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
  sor: number;
  elo: number;
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
  formats: string[];
}

export interface FORMAT {
  name: string;
  amount: number;
  lMargin: number;
  rMargin: number;
}

export interface CONTEST_CATEGORY {
  category: CATEGORY;
  rounds: number;
  format: string;
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
  timeMillis: string;
  penaltyType: PENALTY;
  penaltyDetails: string;
  isAverage?: boolean;
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
  seed: string;
  gen: number;
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
  | "btn-primary"
  | "btn-secondary"
  | "btn-accent"
  | "btn-neutral"
  | "btn-base-100"
  | "btn-base-200"
  | "btn-base-300"
  | "btn-info"
  | "btn-success"
  | "btn-warning"
  | "btn-error";

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
  times: {
    time: number | null;
    tag: string;
  }[];
  format: string;
}

interface USER_PROFILE_RESULT {
  place: number;
  amount: number;
  points: number;
  contests: USER_PROFILE_CONTEST[];
}

export interface USER_RECORD_RESULT {
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

interface RANK_SUMMARY {
  category: string;
  contest: string;
  name: string;
  position: number;
  time: number;
  type: "Single" | "Media";
}

export interface USER_PROFILE {
  user: USER;
  results: USER_PROFILE_RESULT[];
  records: USER_RECORD;
  contests: { name: string; date: Date }[];
  totalContests: number;
  rankSummary: RANK_SUMMARY[];
  elo: number;
  sor: number;
}

export const PuzzleTypeName = [
  "rubik",
  "icarry",
  "skewb",
  "square1",
  "pyraminx",
  "axis",
  "fisher",
  "ivy",
  "clock",
  "megaminx",
  "mirror",
  "dino",
  "rex",
  "redi",
  "mixup",
  "pyramorphix",
  "gear",
  "dreidel",
  "bandaged222",
  "bicube",
  "square2",
  "pandora",
  "ultimateSkewb",
  "pyraminxCrystal",
  "tetraminx",
  "meierHalpernPyramid",
  "sq1Star",
  "windmill",
  "helicopter",
  "supersquare1",
  "fto",
  "timemachine",
  "masterskewb",
  "void",
  "diamondcube",
  "axis44",
  "fisher44",
  "redibarrel",
  "twisty33",
  "ghost",
  "barrel33",
] as const;

export declare type PuzzleType = (typeof PuzzleTypeName)[number];

export interface IReconstruction {
  sequence: string[];
  sequenceIndex: number[];
  finalAlpha: number;
  result: string;
  hasError: boolean;
}

export interface IPuzzleOrder {
  a: number;
  b: number;
  c: number;
}
