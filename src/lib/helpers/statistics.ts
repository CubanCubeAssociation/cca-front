import type { CONTEST_CATEGORY, FORMAT, ROUND, SOLVE } from "../interfaces";
import { MultiSet } from "./multiset";
import { checkPath, createPath } from "./object";
import { infinitePenalty, stringToMillis } from "./timer";

export function minmax(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(v, b));
}

export function getStatsCFromContest(solves: ROUND[]) {
  const mp = solves.reduce((acc, s) => {
    const ct = s.category.name;
    const rnd = s.round.toString();
    const us = s.contestant.name;

    if (!checkPath(acc, [ct, rnd, us], true)) {
      createPath(acc, [ct, rnd, us], [], true);
    }

    // @ts-expect-error es garantía que el camino existe
    acc.get(ct).get(rnd).get(us).push(s);

    return acc;
  }, new Map<string, Map<string, Map<string, SOLVE[]>>>());

  return [...mp].map(e => [e[0], [...e[1]].map(e1 => [e1[0], [...e1[1]]])]);
}

export function mean(values: number[]): number {
  const cant = values.length;
  return cant ? values.reduce((a, b) => a + b, 0) / cant : 0;
}

export function median(values: number[]): number {
  const cant = values.length;
  const v1 = values.slice().sort((a, b) => a - b);
  if (cant % 2 === 0) {
    return mean(v1.slice(cant / 2 - 1, cant / 2 + 1));
  }
  return v1[cant >> 1];
}

export function stdDev(values: number[], avg: number): number {
  const len = values.length;
  return len > 0 ? Math.sqrt(values.reduce((acc, e) => acc + (e - avg) ** 2 / len, 0)) : 0;
}

export function trendLSV(values: number[][]): { m: number; n: number } {
  const n = values.length;
  let Sx = 0,
    Sy = 0,
    Sxx = 0,
    Sxy = 0;

  for (let i = 0; i < n; i += 1) {
    const x = values[i][0],
      y = values[i][1];
    Sx += x;
    Sy += y;
    Sxx += x * x;
    Sxy += x * y;
  }

  const beta = (n * Sxy - Sx * Sy) / (n * Sxx - Sx ** 2);
  const alpha = (Sy - beta * Sx) / n;

  return { m: beta, n: alpha };
}

export function adjustMillis(n: number, round = false): number {
  return (!round ? Math.floor : Math.round)(n / 10) * 10;
}

export function getAverage(n: number, arr: number[]): (number | null)[] {
  const res: (number | null)[] = [];
  const set: MultiSet<number> = new MultiSet();
  const d = n === 3 ? 0 : Math.ceil(n * 0.05);
  const len = arr.length - 1;
  let infP = 0;
  let sum = 0;

  for (let i = 0, maxi = len; i <= maxi; i += 1) {
    const t = arr[i] || Infinity;

    set.add(t);
    infP += isFinite(t) ? 0 : 1;
    sum += isFinite(t) ? t : 0;

    if (i + 1 < n) {
      res.push(null);
    } else {
      if (infP > d) {
        res.push(null);
      } else {
        const elems = set.toArray();
        let s = sum;

        elems.slice(0, d).forEach(v => (s -= v));

        if (d) {
          elems
            .slice(-d)
            .filter(isFinite)
            .forEach(v => (s -= v));
        }

        res.push(adjustMillis(s / (n - 2 * d), true));
      }

      const t1 = arr[i - n + 1] || Infinity;
      set.rem(t1);
      infP -= isFinite(t1) ? 0 : 1;
      sum -= isFinite(t1) ? t1 : 0;
    }
  }

  return res;
}

function getSolveTime(s: SOLVE): number {
  return infinitePenalty(s) ? Infinity : stringToMillis(s.time);
}

export function getAverageS(n: number, arr: SOLVE[]): (number | null)[] {
  return getAverage(n, arr.map(getSolveTime));
}

export function getContestAverage(arr: SOLVE[], format: FORMAT): number {
  const solves: SOLVE[] = [];

  arr.sort((s1: SOLVE, s2: SOLVE) => {
    return !s1.isExtra && s2.isExtra ? -1 : 0;
  });

  for (let i = 0, maxi = arr.length; i < maxi; i += 1) {
    if (arr[i].isExtra && arr[i].extra < 0) continue;
    solves[arr[i].isExtra ? arr[i].extra - 1 : i] = arr[i];
  }

  let nSolves = solves.slice(0, format.amount);
  nSolves.sort((a, b) => getSolveTime(a) - getSolveTime(b));
  nSolves = nSolves.slice(format.lMargin, format.amount - format.rMargin);
  const avg = mean(nSolves.map(getSolveTime));

  return avg ? avg : Infinity;
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

export function getRoundsInfo(rnds: ROUND[], categories: CONTEST_CATEGORY[], formats: FORMAT[]) {
  rnds.forEach(rnd => {
    let ct = categories.find(c => c.category.id === rnd.category.id);

    if (!ct) {
      throw new ReferenceError(
        `Category ${rnd.category.id} not found in categories ${categories.map(c => c.category.id).join(", ")}`
      );
    }

    let format = formats.find(f => f.name === ct.format);

    if (!format) {
      throw new ReferenceError(
        `Format ${ct.format} not found in formats ${formats.map(f => f.name).join(", ")}`
      );
    }

    rnd.average = getContestAverage(
      [rnd.t1, rnd.t2, rnd.t3, rnd.t4, rnd.t5, rnd.e1, rnd.e2],
      format
    );
  });

  const rounds = sortSolves(rnds);
  const roundGroup: ROUND[][][] = [];

  for (let i = 0, p = -1, maxi = rnds.length; i < maxi; i += 1) {
    const r = rnds[i].round;

    if (i === 0 || (i > 0 && rnds[i].category.id != rnds[i - 1].category.id)) {
      p += 1;
      roundGroup[p] = [];
      roundGroup[p][r - 1] = [];
    }

    if (i > 0 && rnds[i].category.id === rnds[i - 1].category.id && r != rnds[i - 1].round) {
      roundGroup[p][r - 1] = [];
    }

    roundGroup[p][r - 1].push(rnds[i]);
  }

  return { rounds, roundGroup };
}

export function getBest(arr: number[]): number[][] {
  let best = Infinity;
  const bests = [];
  const len = arr.length - 1;

  for (let i = 0, maxi = len + 1; i < maxi; i += 1) {
    if (!arr[i]) {
      continue;
    }

    if (arr[i] < best) {
      best = arr[i];
      bests.push([i, best]);
    }
  }

  return bests;
}
