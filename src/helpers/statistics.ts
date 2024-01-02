import type { ROUND, SOLVE } from "../interfaces";
import { createPath } from "./object";
import { infinitePenalty, stringToMillis } from "./timer";

export function getStatsCFromContest(solves: ROUND[]) {
  let mp = solves.reduce((acc, s) => {
    let ct = s.category.name;
    let us = s.contestant.name;

    createPath(acc, [ ct, us ], [], true);
    
    // @ts-ignore
    acc.get(ct).get(us).push( s );
    
    return acc;
  }, new Map< string, Map<string, SOLVE[]> >);

  let results: any[] = [];

  mp.forEach((cv, ck) => {
    let cat: any[] = [];

    cv.forEach((uv, uk) => {

      uv.sort((a, b) => {
        if ( a.round != b.round ) {
          return a.round - b.round;
        }
        return a.solve - b.solve;
      });

      cat.push([uk, uv]);
    });

    results.push([ ck, cat ]);
  });

  return results;
}

export function mean(values: number[]): number {
  let cant = values.length;
  return cant ? values.reduce((a, b) => a + b, 0) / cant : 0;
}

export function median(values: number[]): number {
  let cant = values.length;
  let v1 = values.slice().sort((a, b) => a - b);
  if ( cant % 2 === 0 ) {
    return mean(v1.slice(cant / 2 - 1, cant / 2 + 1));
  }
  return v1[ cant >> 1 ];
}

export function getAverage(n: number, arr: number[]): (number | null)[] {
  let res: (number | null)[] = [];
  let len = arr.length - 1;
  let elems: number[] = [];
  let disc = (n === 3) ? 0 : Math.ceil(n * 0.05);

  for (let i = 0, maxi = len; i <= maxi; i += 1) {
    elems.push( arr[len - i] );

    if ( elems.length < n ) {
      res.push(null);
    } else {
      let e1 = elems.slice().sort((a, b) => isFinite(a) && isFinite(b) ? a - b : isFinite(a) ? -1 : 1);
      let sumd = e1.reduce((s, e, p) => {
        return (p >= disc && p < n - disc) ? s + e : s;
      }, 0);
      
      res.push( isFinite(sumd) ? sumd / (n - disc * 2) : null);

      elems.shift();
    }
  }

  return res;
}

export function getAverageS(n: number, arr: SOLVE[]): (number | null)[] {
  return getAverage(n,
    arr.map(e => infinitePenalty(e)
      ? Infinity
      : stringToMillis(e.time)
    )
  );
}