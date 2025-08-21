import {
  PENALTY,
  type CATEGORY,
  type CONTEST,
  type FORMAT,
  type ROUND,
  type SOLVE,
  type USER,
} from "@interfaces";

export function checkPath(obj: any, path: string[], useMap: boolean = false): boolean {
  if (typeof obj === "undefined") return false;

  let tmp = obj;

  for (let i = 0, maxi = path.length; i < maxi; i += 1) {
    if (useMap && tmp.has(path[i])) {
      tmp = tmp.get(path[i]);
    } else if (!useMap && Object.prototype.hasOwnProperty.call(tmp, path[i])) {
      tmp = tmp[path[i]];
    } else {
      return false;
    }
  }

  return true;
}

export function createPath(obj: any, path: string[], def: any, useMap: boolean = false): any {
  if (typeof obj === "undefined") return obj;

  const objSetter = (o: any, p: any, v: any) => (o[p] = v);
  const mapSetter = (m: Map<any, any>, p: any, v: any) => m.set(p, v);

  path.reduce((acc, p, pos) => {
    const altV = pos + 1 === path.length ? def : useMap ? new Map<string, any>() : {};

    if ((!pos && acc instanceof Map) || (pos && useMap)) {
      mapSetter(acc, p, altV);
    } else {
      objSetter(acc, p, acc[p] || altV);
    }

    return acc instanceof Map ? acc.get(p) : acc[p];
  }, obj);

  return obj;
}

type MODEL =
  | "CONTEST"
  | "SOLVE"
  | "USER"
  | "CATEGORY"
  | "contestant"
  | "solve"
  | "round"
  | "category";

function isModel(md: string, k: string) {
  return (md.startsWith("$") ? md.slice(1) : md.split(":")[0]) === k;
}

function removeID(obj: any) {
  const res = Object.assign({}, obj);
  delete res._id;

  return res;
}

export function fromModel(obj: any, model: MODEL) {
  const REFS: { [k: string]: string[] } = {
    CATEGORY: [],
    USER: [],
    CONTEST: ["contestants:contestant", "rounds:round", "categories:category"],
    round: ["$category", "$contestant"],
    contestant: ["$user", "categories"],
    category: ["$category"],
  };

  const RMODEL = REFS[model];

  const res: any = {};
  const entries = Object.entries(obj);

  for (let i = 0, maxi = entries.length; i < maxi; i += 1) {
    const { 0: k, 1: v } = entries[i] as any;

    const md = RMODEL.find(md => isModel(md, k));

    // if (k === "format") console.log(k, v, md);

    if (md) {
      const p = md.startsWith("$") ? md.slice(1) : md.split(":");

      if (Array.isArray(p)) {
        res[k] = v.map((e: any) =>
          p.length === 2 ? removeID(fromModel(e, p[1] as MODEL)) : typeof e === "string" ? e : e.id
        );
      } else {
        res[k] = typeof v === "string" ? v : v.id;
      }
    } else {
      if (k != "id") {
        res[k] = v;
      }

      if (model === "round" && /^[et][12345]$/.test(k)) {
        res[k].time = res[k].time || "DNS";
      }
    }
  }

  return res;
}

export function uniqueArray(arr: any[], cr: (...args: any) => any): any[] {
  const key = new Set();
  const crs = arr.map(cr);

  arr.forEach((_, p) => key.add(crs[p]));

  return arr.filter((_, p) => {
    if (!key.has(crs[p])) return false;

    key.delete(crs[p]);
    return true;
  });
}

export function clone(obj: any): any {
  switch (typeof obj) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
    case "function":
      return obj;
  }

  if (obj === null) return obj;

  if (typeof obj === "bigint") {
    return BigInt(obj);
  }

  if (Array.isArray(obj)) return obj.map(clone);

  return Object.entries(obj).reduce((acc: any, e) => {
    acc[e[0]] = clone(e[1]);
    return acc;
  }, {});
}

export function preventDefault(cb: (ev: Event) => any) {
  return (ev: Event) => {
    ev.preventDefault();
    cb(ev);
  };
}

export function createEmptyCategory(): CATEGORY {
  return {
    formats: [],
    id: "",
    name: "",
    scrambler: "333",
  };
}

export function createEmptyUser(): USER {
  return {
    id: "",
    name: "",
    email: "",
    password: "",
    ci: "",
    sex: "M",
    username: "",
    province: "",
    municipality: "",
    credit: 0,
    role: "user",
    isEmailVerified: false,
    age: 0,
    elo: 0,
    sor: Infinity,
  };
}

export function createEmptySolve(): SOLVE {
  return {
    time: "",
    timeMillis: "",
    penaltyType: PENALTY.NONE,
    reconstruction: "",
    penaltyDetails: "",
    isExtra: false,
    extra: -1,
    tag: "",
  };
}

export function createEmptyRound(): ROUND {
  return {
    id: "",
    average: 0,
    tag: "",
    category: createEmptyCategory(),
    contestant: createEmptyUser(),
    round: 0,
    e1: createEmptySolve(),
    e2: createEmptySolve(),
    t1: createEmptySolve(),
    t2: createEmptySolve(),
    t3: createEmptySolve(),
    t4: createEmptySolve(),
    t5: createEmptySolve(),
  };
}

export function createEmptyContest(): CONTEST {
  return {
    categories: [],
    contestants: [],
    rounds: [],
    id: "",
    name: "",
    place: "",
    status: "pending",
    date: "",
    inscriptionStart: "",
    inscriptionEnd: "",
    inscriptionCost: 0,
    visible: false,
    seed: "",
    gen: 0,
  };
}

export function createEmptyFormat(): FORMAT {
  return {
    name: "Ao5",
    amount: 5,
    lMargin: 1,
    rMargin: 1,
  };
}

export function newArr(length: number): any[] {
  return Array.from({ length });
}
