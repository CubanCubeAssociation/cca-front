import type { PuzzleInterface } from "@interfaces";
import { STANDARD_PALETTE } from "@constants";

export function RUBIK(n: number): PuzzleInterface {
  const rubik: PuzzleInterface = {
    palette: STANDARD_PALETTE,
    move: () => false,
    getImage: () => "",
    roundParams: {
      ppc: n < 10 ? 10 : n < 20 ? 5 : 2,
    },
  };

  type FaceName = "U" | "R" | "F" | "D" | "L" | "B";
  type FaceColor = keyof typeof STANDARD_PALETTE;
  const FACE_COLOR: Record<FaceName, FaceColor> = {
    U: "white",
    R: "red",
    F: "green",
    D: "yellow",
    L: "orange",
    B: "blue",
  };

  const faces: Record<FaceName, FaceName[][]> = {
    U: [],
    R: [],
    F: [],
    D: [],
    L: [],
    B: [],
  };

  Object.entries(faces).forEach(([e]) => {
    let fn = e as FaceName;
    faces[e as FaceName] = Array.from({ length: n })
      .fill("")
      .map(() => Array.from({ length: n }).fill(fn as FaceName) as FaceName[]);
  });

  type Strip = { get(): FaceName[]; set(vals: FaceName[]): void };
  type Selector = (f: Record<FaceName, FaceName[][]>, k: number) => Strip;
  type ParsedMove = [layers: number, base: FaceName, dir: 1 | -1, exclude: number];

  const cycles: Record<FaceName, Selector[]> = {
    U: [
      (f, k) => ({
        get: () => f.F[k],
        set: vals => {
          f.F[k] = vals;
        },
      }),
      (f, k) => ({
        get: () => f.L[k],
        set: vals => {
          f.L[k] = vals;
        },
      }),
      (f, k) => ({
        get: () => f.B[k],
        set: vals => {
          f.B[k] = vals;
        },
      }),
      (f, k) => ({
        get: () => f.R[k],
        set: vals => {
          f.R[k] = vals;
        },
      }),
    ],

    D: [
      (f, k) => ({
        get: () => f.F[f.F.length - 1 - k],
        set: vals => {
          f.F[f.F.length - 1 - k] = vals;
        },
      }),
      (f, k) => ({
        get: () => f.R[f.R.length - 1 - k],
        set: vals => {
          f.R[f.R.length - 1 - k] = vals;
        },
      }),
      (f, k) => ({
        get: () => f.B[f.B.length - 1 - k],
        set: vals => {
          f.B[f.B.length - 1 - k] = vals;
        },
      }),
      (f, k) => ({
        get: () => f.L[f.L.length - 1 - k],
        set: vals => {
          f.L[f.L.length - 1 - k] = vals;
        },
      }),
    ],

    R: [
      (f, k) => ({
        get: () => f.F.map(row => row[f.F.length - 1 - k]),
        set: vals => f.F.forEach((row, i) => (row[f.F.length - 1 - k] = vals[i])),
      }),
      (f, k) => ({
        get: () => f.U.map(row => row[f.U.length - 1 - k]),
        set: vals => f.U.forEach((row, i) => (row[f.U.length - 1 - k] = vals[i])),
      }),
      (f, k) => ({
        get: () => f.B.map(row => row[k]).reverse(),
        set: vals => f.B.forEach((row, i) => (row[k] = vals[f.B.length - 1 - i])),
      }),
      (f, k) => ({
        get: () => f.D.map(row => row[f.D.length - 1 - k]),
        set: vals => f.D.forEach((row, i) => (row[f.D.length - 1 - k] = vals[i])),
      }),
    ],

    L: [
      (f, k) => ({
        get: () => f.F.map(row => row[k]),
        set: vals => f.F.forEach((row, i) => (row[k] = vals[i])),
      }),
      (f, k) => ({
        get: () => f.D.map(row => row[k]),
        set: vals => f.D.forEach((row, i) => (row[k] = vals[i])),
      }),
      (f, k) => ({
        get: () => f.B.map(row => row[f.B.length - 1 - k]).reverse(),
        set: vals => f.B.forEach((row, i) => (row[f.B.length - 1 - k] = vals[f.B.length - 1 - i])),
      }),
      (f, k) => ({
        get: () => f.U.map(row => row[k]),
        set: vals => f.U.forEach((row, i) => (row[k] = vals[i])),
      }),
    ],

    F: [
      (f, k) => ({
        get: () => f.U[f.U.length - 1 - k],
        set: vals => {
          f.U[f.U.length - 1 - k] = vals;
        },
      }),
      (f, k) => ({
        get: () => f.R.map(row => row[k]),
        set: vals => f.R.forEach((row, i) => (row[k] = vals[i])),
      }),
      (f, k) => ({
        get: () => f.D[k].slice().reverse(),
        set: vals => {
          f.D[k] = vals.slice().reverse();
        },
      }),
      (f, k) => ({
        get: () => f.L.map(row => row[f.L.length - 1 - k]).reverse(),
        set: vals => f.L.forEach((row, i) => (row[f.L.length - 1 - k] = vals[f.L.length - 1 - i])),
      }),
    ],

    B: [
      (f, k) => ({
        get: () => f.U[k].slice().reverse(),
        set: vals => {
          f.U[k] = vals.slice().reverse();
        },
      }),
      (f, k) => ({
        get: () => f.L.map(row => row[k]),
        set: vals => f.L.forEach((row, i) => (row[k] = vals[i])),
      }),
      (f, k) => ({
        get: () => f.D[f.D.length - 1 - k],
        set: vals => {
          f.D[f.D.length - 1 - k] = vals;
        },
      }),
      (f, k) => ({
        get: () => f.R.map(row => row[f.R.length - 1 - k]).reverse(),
        set: vals => f.R.forEach((row, i) => (row[f.R.length - 1 - k] = vals[f.R.length - 1 - i])),
      }),
    ],
  };

  function rotateFace(face: FaceName[][], count: number): FaceName[][] {
    const n = face.length;
    const times = ((count % 4) + 4) % 4;

    const result = Array.from({ length: n }, () => Array(n).fill("") as FaceName[]);

    const mapIndex = [
      (i: number, j: number) => [i, j],
      (i: number, j: number) => [j, n - 1 - i],
      (i: number, j: number) => [n - 1 - i, n - 1 - j],
      (i: number, j: number) => [n - 1 - j, i],
    ];

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const [ni, nj] = mapIndex[times](i, j);
        result[ni][nj] = face[i][j];
      }
    }

    return result;
  }

  function doMove(f: typeof faces, move: ParsedMove) {
    let [layers, base, dir, span] = move;

    span = span || layers;

    if (span === layers) {
      f[base] = rotateFace(f[base], dir);
    }

    if (span === n) {
      let e = Object.entries(faces);
      let opBase = e[
        (e.reduce((acc, e, p) => (e[0] === base ? p : acc), -1) + 3) % 6
      ][0] as FaceName;
      f[opBase] = rotateFace(f[opBase], -dir);
    }

    const cycle = cycles[base];

    if (!cycle) return;

    for (let k = layers - span; k < layers; k += 1) {
      const strips = cycle.map(fn => fn(f, k).get());
      const shift = ((dir % cycle.length) + cycle.length) % cycle.length;
      const rotated = strips.map((_, i) => strips[(i - shift + cycle.length) % cycle.length]);

      rotated.forEach((strip, i) => {
        cycle[i](f, k).set(strip);
      });
    }
  }

  rubik.move = function (moves: any[]) {
    moves.forEach(mv => doMove(faces, mv));
  };

  rubik.getImage = () => {
    const BOX = 100;
    const W = BOX * 4;
    const H = BOX * 3;
    const CW = BOX / n;
    const PIECE_FACTOR = 0.9;
    const BOX_FACTOR = 0.9;
    const OFFSET = (CW * (1 - PIECE_FACTOR)) / 2;
    const BOX_OFFSET = (BOX * (1 - BOX_FACTOR)) / 2;
    const RX = 3 / n + 0.4;

    let getRect = (x: number, y: number, bx: number, by: number, fc: FaceName) => {
      return `<rect
  x="${bx * BOX + BOX_OFFSET + x * CW * BOX_FACTOR + OFFSET}"
  y="${by * BOX + BOX_OFFSET + y * CW * BOX_FACTOR + OFFSET}"
  width="${CW * PIECE_FACTOR * BOX_FACTOR}"
  height="${CW * PIECE_FACTOR * BOX_FACTOR}"
  fill="${STANDARD_PALETTE[FACE_COLOR[fc]]}"
  rx="${RX}"
/>`;
    };

    let allPieces = [
      ["U", 1, 0],
      ["L", 0, 1],
      ["F", 1, 1],
      ["R", 2, 1],
      ["B", 3, 1],
      ["D", 1, 2],
    ]
      .map(e =>
        faces[e[0] as FaceName]
          .map((v, y) =>
            v.map((fc, x) => getRect(x, y, e[1] as number, e[2] as number, fc)).join("")
          )
          .join("")
      )
      .join("");

    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <svg xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin">
      ${allPieces}
    </svg>`;
  };

  return rubik;
}
