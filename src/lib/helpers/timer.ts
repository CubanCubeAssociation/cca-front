import { PENALTY, type SOLVE } from "../interfaces";

export function timer(val: number, dec?: boolean, suff?: boolean): string {
  if (val === Infinity || val === -Infinity) return "DNF";
  if (isNaN(val)) return (dec ? "0.00" : "0") + (suff ? "s" : "");

  let v = ~~(val / 10);
  const ms = v % 100;
  v = ~~(v / 100);
  const s = v % 60;
  v = ~~(v / 60);
  const m = v % 60;
  v = ~~(v / 60);
  const h = v;

  const l2 = (s: number) => ("00" + s).slice(-2);

  let res = "";
  let sf = "";

  if (h) {
    res = `${h}h ${m}:${l2(s)}`;
  } else if (m) {
    res = `${m}:${l2(s)}`;
    sf = "m";
  } else {
    res = `${s}`;
    sf = "s";
  }

  return res + (dec ? `.${l2(ms)}` : "") + (suff ? sf : "");
}

export function stringToMillis(s: string): number {
  if (s === "DNS" || s === "DNF") return Infinity;

  const arr = s
    .replace(/^0+/, "")
    .replace(/\B(?=(\d{2})+(?!\d))/g, ",")
    .split(",")
    .map(Number)
    .reverse();

  const mults = [10, 100, 60, 60, 24];

  return arr.reduce((acc, e, p) => [acc[0] + acc[1] * mults[p] * e, acc[1] * mults[p]], [0, 1])[0];
}

export function actualTime(s: SOLVE): number {
  if (s.penaltyType === PENALTY.DNS) return 1 / 0;
  if (s.penaltyType === PENALTY.DNF) return 1 / 0;
  const penalties = s.penaltyDetails.replace(/[^1]/g, "").length;
  return stringToMillis(s.time) + penalties * 2;
}

export function sTimer(s: SOLVE | undefined, dec?: boolean, suff?: boolean): string {
  if (!s) return "";
  if (s.penaltyType === PENALTY.DNS) return "DNS";
  if (s.penaltyType === PENALTY.DNF) return "DNF";
  return timer(actualTime(s), dec, suff);
}

export function infinitePenalty(s: SOLVE): boolean {
  return s.penaltyType === PENALTY.DNF || s.penaltyType === PENALTY.DNS;
}
