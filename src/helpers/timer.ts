import { PENALTY, type SOLVE } from "../interfaces";

export function timer(val: number, dec?: boolean, suff?: boolean, html?: boolean): string {
  if (val === Infinity) return "DNF";
  if (isNaN(val)) return dec ? "0.00" : "0";

  let v = ~~(val / 10);
  let ms = v % 100;
  v = ~~(v / 100);
  let s = v % 60;
  v = ~~(v / 60);
  let m = v % 60;
  v = ~~(v / 60);
  let h = v % 60;
  v = ~~(v / 60);
  let p1 = [h, m].filter(e => e != 0);

  p1.push(s);

  let sf = ["s", "m", "h"][p1.length - 1];
  let _html = ~~(html || 0);

  let newP1 = p1
    .map((e, p) => {
      if (p > 0)
        return (
          ["", '<span class="digit">'][_html] + ("00" + e).substr(-2, 2) + ["", "</span>"][_html]
        );
      return ["", '<span class="digit">'][_html] + e + ["", "</span>"][_html];
    })
    .join(":");

  let time =
    dec || (suff && sf === "s")
      ? newP1 +
        `.${
          ["", '<span class="digit">'][_html] + ("00" + ms).substr(-2, 2) + ["", "</span>"][_html]
        }`
      : newP1;

  return time + (suff ? sf : "");
}

export function stringToMillis(s: string): number {
  if (s === "DNS" || s === "DNF") return Infinity;

  let arr = s
    .replace(/^0+/, "")
    .replace(/\B(?=(\d{2})+(?!\d))/g, ",")
    .split(",")
    .map(Number)
    .reverse();

  let mults = [10, 100, 60, 60, 24];

  return arr.reduce((acc, e, p) => [acc[0] + acc[1] * mults[p] * e, acc[1] * mults[p]], [0, 1])[0];
}

export function actualTime(s: SOLVE): number {
  if (s.penaltyType === PENALTY.DNS) return 1 / 0;
  if (s.penaltyType === PENALTY.DNF) return 1 / 0;
  let penalties = s.penaltyDetails.replace(/[^1]/g, "").length;
  return stringToMillis(s.time) + penalties * 2;
}

export function sTimer(
  s: SOLVE | undefined,
  dec?: boolean,
  suff?: boolean,
  html?: boolean
): string {
  if (!s) return "";
  if (s.penaltyType === PENALTY.DNS) return "DNS";
  if (s.penaltyType === PENALTY.DNF) return "DNF";
  return timer(actualTime(s), dec, suff, html);
}

export function infinitePenalty(s: SOLVE): boolean {
  return s.penaltyType === PENALTY.DNF || s.penaltyType === PENALTY.DNS;
}
