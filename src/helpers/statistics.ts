import type { ROUND, SOLVE } from "../interfaces";
import { MultiSet } from "./multiset";
import { checkPath, createPath } from "./object";
import { infinitePenalty, stringToMillis } from "./timer";

export function minmax(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(v, b));
}

export function getStatsCFromContest(solves: ROUND[]) {
  console.log("SOLVES: ", solves);

  let mp = solves.reduce((acc, s) => {
    let ct = s.category.name;
    let rnd = s.round.toString();
    let us = s.contestant.name;

    if (!checkPath(acc, [ct, rnd, us], true)) {
      createPath(acc, [ct, rnd, us], [], true);
    }

    // @ts-ignore
    acc.get(ct).get(rnd).get(us).push(s);

    return acc;
  }, new Map<string, Map<string, Map<string, SOLVE[]>>>());

  return [...mp].map(e => [e[0], [...e[1]].map(e1 => [e1[0], [...e1[1]]])]);
}

export function mean(values: number[]): number {
  let cant = values.length;
  return cant ? values.reduce((a, b) => a + b, 0) / cant : 0;
}

export function median(values: number[]): number {
  let cant = values.length;
  let v1 = values.slice().sort((a, b) => a - b);
  if (cant % 2 === 0) {
    return mean(v1.slice(cant / 2 - 1, cant / 2 + 1));
  }
  return v1[cant >> 1];
}

export function adjustMillis(n: number, round = false): number {
  return (!round ? Math.floor : Math.round)(n / 10) * 10;
}

export function getAverage(n: number, arr: number[]): (number | null)[] {
  let res: (number | null)[] = [];
  let set: MultiSet<number> = new MultiSet();
  let d = n === 3 ? 0 : Math.ceil(n * 0.05);
  let len = arr.length - 1;
  let infP = 0;
  let sum = 0;

  let getIndex = (i: number) => len - i;

  for (let i = 0, maxi = len; i <= maxi; i += 1) {
    let t = arr[getIndex(i)];

    set.add(t);
    infP += isFinite(t) ? 0 : 1;
    sum += isFinite(t) ? t : 0;

    if (i + 1 < n) {
      res.push(null);
    } else {
      if (infP > d) {
        res.push(null);
      } else {
        let elems = set.toArray();
        let s = sum;

        elems.slice(0, d).forEach(v => (s -= v));
        d &&
          elems
            .slice(-d)
            .filter(isFinite)
            .forEach(v => (s -= v));

        res.push(adjustMillis(s / (n - 2 * d), true));
      }

      let t1 = arr[getIndex(i - n + 1)];
      set.rem(t1);
      infP -= isFinite(t1) ? 0 : 1;
      sum -= isFinite(t1) ? t1 : 0;
    }
  }

  return res;
}

export function getAverageS(n: number, arr: SOLVE[]): (number | null)[] {
  return getAverage(
    n,
    arr.map(e => (infinitePenalty(e) ? Infinity : stringToMillis(e.time)))
  );
}

export function getContestAverage(arr: SOLVE[], mode: "Ao5" | "Mo3" = "Ao5"): number {
  let solves: SOLVE[] = [];

  arr.sort((s1: SOLVE, s2: SOLVE) => {
    return !s1.isExtra && s2.isExtra ? -1 : 0;
  });

  for (let i = 0, maxi = arr.length; i < maxi; i += 1) {
    if (arr[i].isExtra && arr[i].extra < 0) continue;
    solves[arr[i].isExtra ? arr[i].extra - 1 : i] = arr[i];
  }

  let n = mode === "Ao5" ? 5 : 3;

  return getAverageS(n, solves.slice(0, n))[n - 1] || Infinity;
}

function sortSolves(rnd: ROUND[]) {
  return rnd.sort((a, b) => {
    if (a.category.id != b.category.id) {
      return a.category.name < b.category.name ? -1 : 1;
    }

    if (a.round != b.round) {
      return a.round - b.round;
    }

    if (a.average != b.average) {
      return a.average - b.average;
    }

    return a.contestant.name < b.contestant.name ? -1 : 1;
  });
}

export function getRoundsInfo(rnds: ROUND[]) {
  rnds.forEach(rnd => {
    rnd.average = getContestAverage(
      [rnd.t1, rnd.t2, rnd.t3, rnd.t4, rnd.t5, rnd.e1, rnd.e2],
      rnd.category.scrambler === "666wca" || rnd.category.scrambler === "777wca" ? "Mo3" : "Ao5"
    );
  });

  let rounds = sortSolves(rnds);
  let roundGroup: ROUND[][] = [];

  for (let i = 0, p = -1, maxi = rnds.length; i < maxi; i += 1) {
    if (i === 0 || (i > 0 && rnds[i].category.id != rnds[i - 1].category.id)) {
      p += 1;
      roundGroup[p] = [];
    }

    roundGroup[p].push(rnds[i]);
  }

  return { rounds, roundGroup };
}
