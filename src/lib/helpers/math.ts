import type { BezierCurve } from "@classes/puzzle/BezierCurve";
import { BACK, CENTER, DOWN, FRONT, LEFT, RIGHT, UP, Vector3D } from "@classes/vector3d";
import { EPS } from "@constants";

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

export function isFinite(n: number): boolean {
  return !(n === Infinity || n === -Infinity);
}

export function rotateBundle(
  points: (Vector3D | BezierCurve)[],
  O: Vector3D,
  u: Vector3D,
  ang: number
): (Vector3D | BezierCurve)[] {
  return points.map(p => p.rotate(O, u, ang));
}

export function cmd(command: string, command1: string = "", len: number = 0) {
  const dirMap: any = {
    U: UP,
    R: RIGHT,
    F: FRONT,
    D: DOWN,
    L: LEFT,
    B: BACK,
  };

  const sum = command
    .split("")
    .filter(c => c in dirMap)
    .reduce((acc, c) => acc.add(dirMap[c], true), new Vector3D());

  const sum1 = command1
    .split("")
    .filter(c => c in dirMap)
    .reduce((acc, c) => acc.add(dirMap[c], true), new Vector3D());

  return sum.add(sum1.mul(len), true);
}

export function pascal(n: number) {
  if (n <= 0) return [1];

  const res = [[1], []];
  let cur = 1;

  for (let i = 1; i <= n; i += 1) {
    res[cur] = res[1 - cur].map((n, p, a) => (p === 0 ? 1 : n + a[p - 1]));
    res[cur].push(1);
    cur ^= 1;
  }

  return res[1 - cur];
}

export function bezier(pts: Vector3D[], points: number): Vector3D[] {
  const res: Vector3D[] = [];
  const n = pts.length - 1;
  const Cnk = pascal(n);

  for (let j = 0; j <= points; j += 1) {
    const a = j / points;
    res.push(
      pts.reduce((ac: Vector3D, p: Vector3D, pos: number) => {
        return ac.add(p.mul(Cnk[pos] * Math.pow(1 - a, n - pos) * Math.pow(a, pos)), true);
      }, new Vector3D())
    );
  }

  return res;
}

export function lineIntersection3D(
  a: Vector3D,
  ua: Vector3D,
  b: Vector3D,
  ub: Vector3D
): Vector3D | null {
  const v1 = ua.cross(ub);
  const v2 = b.sub(a).cross(ub);

  if (v1.abs() < EPS) return null;

  const r = v2.abs() / v1.abs();

  if (v1.mul(r).sub(v2).abs() < EPS) {
    return a.add(ua.mul(r));
  }

  if (v1.mul(-r).sub(v2).abs() < EPS) {
    return a.add(ua.mul(-r));
  }

  return null;
}

// Circle that goes through p1 and p3 with p1p2 and p2p3 being tangent to the circle
export function circle(p1: Vector3D, p2: Vector3D, p3: Vector3D, PPC: number): Vector3D[] {
  const PI_2 = Math.PI / 2;
  const P = [p1, p2, p3];
  const v1 = p1.sub(p2);
  const v2 = p3.sub(p2);

  const u = Vector3D.cross(P[0], P[1], P[2]).unit();

  if (Math.abs(v1.abs() - v2.abs()) < EPS) {
    const center = lineIntersection3D(
      P[0],
      v1.rotate(CENTER, u, PI_2),
      P[2],
      v2.rotate(CENTER, u, PI_2)
    );

    if (center) {
      const sides = [v1.abs(), v2.abs(), v1.sub(v2).abs()];
      const ang =
        Math.PI -
        Math.acos((sides[2] ** 2 - sides[0] ** 2 - sides[1] ** 2) / (-2 * sides[0] * sides[1]));
      const pts: Vector3D[] = [];

      for (let j = 0; j <= PPC; j += 1) {
        const a = j / PPC;
        pts.push(P[0].rotate(center, u, a * ang));
      }

      return pts;
    }
  }

  return bezier(P, PPC);
}

export function getCircle(p1: Vector3D, p2: Vector3D, p3: Vector3D, PPC: number) {
  const PI_2 = Math.PI / 2;
  const u = Vector3D.cross(p1, p2, p3);
  const mid1 = p1.add(p2).div(2);
  const mid2 = p3.add(p2).div(2);
  const d1 = p1.sub(p2).rotate(CENTER, u, PI_2, true);
  const d2 = p3.sub(p2).rotate(CENTER, u, PI_2, true);

  const center = lineIntersection3D(mid1, d1, mid2, d2);

  if (!center) return bezier([p1, p2, p3], PPC);

  // let sides = [d1.abs(), d2.abs(), d1.sub(d2).abs()];
  const sides = [
    center.sub(p1).abs(),
    center.sub(p3).abs(),
    center.sub(p3).sub(center.sub(p1)).abs(),
  ];
  const ang = Math.acos(
    (sides[2] ** 2 - sides[0] ** 2 - sides[1] ** 2) / (-2 * sides[0] * sides[1])
  );
  const pts: Vector3D[] = [];

  console.log("ANG: ", ang);

  for (let j = 0; j <= PPC; j += 1) {
    const a = j / PPC;
    pts.push(p1.rotate(center, u, a * ang));
  }

  return pts;
}

export function map(v: number, a: number, b: number, A: number, B: number): number {
  return b === a ? A : ((v - a) * (B - A)) / (b - a) + A;
}

export function toInt(n: number, d: number): number {
  const pot = 10 ** d;
  return Math.floor(n / pot) * pot;
}
