export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function between(n: number, a: number, b: number): number {
  const na = Math.min(a, b);
  const nb = Math.max(a, b);
  return Math.min(nb, Math.max(na, n));
}

export function getEloDecay(contests: number) {
  return Math.exp((contests - 1) * -0.01);
}
