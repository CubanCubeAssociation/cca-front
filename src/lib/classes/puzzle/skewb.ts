import { RIGHT, LEFT, DOWN, FRONT } from "./../vector3d";
import { Vector3D, CENTER, BACK, UP } from "../../classes/vector3d";
import type { PuzzleInterface } from "@interfaces";
import { STANDARD_PALETTE } from "@constants";
import { Piece } from "./Piece";
import { Sticker } from "./Sticker";
import { assignColors, roundStickerCorners } from "./puzzleUtils";
import type { BezierSticker } from "./BezierSticker";
import type { BezierCurve } from "./BezierCurve";

export function SKEWB(): PuzzleInterface {
  const skewb: PuzzleInterface = {
    pieces: [],
    palette: STANDARD_PALETTE,
    faceVectors: [],
    move: () => true,
    roundParams: {},
  };

  const PI = Math.PI;
  const PI_2 = PI / 2;
  const PI_3 = PI / 3;
  const pieces = skewb.pieces || [];

  type FaceName = "U" | "R" | "F" | "D" | "L" | "B";
  type FaceColor = keyof typeof STANDARD_PALETTE;
  type Strip = { get(): FaceName[]; set(vals: FaceName[]): void };
  type Selector = (f: Record<FaceName, FaceName[][]>, k: number) => Strip;
  const FACE_COLOR: Record<FaceName, FaceColor> = {
    U: "white",
    R: "red",
    F: "green",
    D: "yellow",
    L: "orange",
    B: "blue",
  };

  const faces: Record<FaceName, FaceName[]> = {
    U: ["U", "U", "U", "U", "U"], // C1, C2, C3, C4 (clockwise), CENTER
    R: ["R", "R", "R", "R", "R"],
    F: ["F", "F", "F", "F", "F"],
    D: ["D", "D", "D", "D", "D"],
    L: ["L", "L", "L", "L", "L"],
    B: ["B", "B", "B", "B", "B"],
  };

  function update(
    NU: FaceName[],
    NR: FaceName[],
    NF: FaceName[],
    ND: FaceName[],
    NL: FaceName[],
    NB: FaceName[]
  ) {
    faces.U = NU;
    faces.R = NR;
    faces.F = NF;
    faces.D = ND;
    faces.L = NL;
    faces.B = NB;
  }

  function pick(arr: FaceName[], indexes: number[]): FaceName[] {
    return indexes.map(n => arr[n]);
  }

  const cycles: Record<string, (dir: number) => void> = {
    R: (dir: number) => {
      let times = ((dir % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        let NU = [faces.U[0], faces.F[2], ...pick(faces.U, [2, 3, 4])];
        let NR = [faces.R[0], ...faces.D.slice(1)];
        let NF = faces.F.map((v, p) => (p === 2 ? faces.L[3] : v));
        let ND = [faces.D[0], ...pick(faces.B, [2, 3, 0, 4])];
        let NL = faces.L.map((v, p) => (p === 3 ? faces.U[1] : v));
        let NB = pick(faces.R, [3, 0, 1, 2, 4]).map((v, p) => (p === 1 ? faces.B[1] : v));
        update(NU, NR, NF, ND, NL, NB);
      }
    },

    L: (dir: number) => {
      let times = ((dir % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        let NU = faces.U.map((v, p) => (p === 3 ? faces.B[2] : v));
        let NR = faces.R.map((v, p) => (p === 3 ? faces.U[3] : v));
        let NF = pick(faces.L, [3, 1, 1, 2, 4]).map((v, p) => (p === 1 ? faces.F[1] : v));
        let ND = pick(faces.F, [3, 0, 1, 2, 4]).map((v, p) => (p === 2 ? faces.D[2] : v));
        let NL = pick(faces.D, [0, 3, 0, 1, 4]).map((v, p) => (p === 0 ? faces.L[0] : v));
        let NB = faces.B.map((v, p) => (p === 2 ? faces.R[3] : v));
        update(NU, NR, NF, ND, NL, NB);
      }
    },

    U: (dir: number) => {
      let times = ((dir % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        let NU = pick(faces.B, [1, 2, 0, 0, 4]).map((v, p) => (p === 2 ? faces.U[2] : v));
        let NR = faces.R.map((v, p) => (p === 1 ? faces.D[3] : v));
        let NF = faces.F.map((v, p) => (p === 0 ? faces.R[1] : v));
        let ND = faces.D.map((v, p) => (p === 3 ? faces.F[0] : v));
        let NL = faces.U.map((v, p) => (p === 2 ? faces.L[2] : v));
        let NB = pick(faces.L, [3, 0, 1, 0, 4]).map((v, p) => (p === 3 ? faces.B[3] : v));
        update(NU, NR, NF, ND, NL, NB);
      }
    },

    B: (dir: number) => {
      let times = ((dir % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        let NU = faces.U.map((v, p) => (p === 0 ? faces.R[2] : v));
        let NR = faces.R.map((v, p) => (p === 2 ? faces.F[3] : v));
        let NF = faces.F.map((v, p) => (p === 3 ? faces.U[0] : v));
        let ND = faces.L.map((v, p) => (p === 1 ? faces.D[1] : v));
        let NL = pick(faces.B, [3, 0, 1, 2, 4]).map((v, p) => (p === 1 ? faces.L[1] : v));
        let NB = pick(faces.D, [0, 2, 3, 0, 4]).map((v, p) => (p === 0 ? faces.B[0] : v));
        update(NU, NR, NF, ND, NL, NB);
      }
    },
  };

  const moveMap = "FURLBfrlbxyz";
  skewb.move = function (moves: any[]) {
    moves.forEach(mv => {
      cycles[moveMap[mv[0]]](mv[1]);
    });
  };

  skewb.getImage = () => {
    const BOX = 100;
    const W = BOX * 4;
    const H = BOX * 3;
    const BOX_FACTOR = 0.9;
    const BOX_OFFSET = (BOX * (1 - BOX_FACTOR)) / 2;

    let getRoundedPath = (path: number[][]): string => {
      let st = new Sticker(path.map(p => new Vector3D(p[0], p[1], 0)));
      let pts = (roundStickerCorners(st, 0.2, 1, 10, true) as BezierSticker).parts;
      let res: string[] = [];

      for (let j = 0, maxj = pts.length; j < maxj; j += 1) {
        if (pts[j] instanceof Vector3D) {
          const pt = pts[j] as Vector3D;

          if (j === 0) {
            res.push(`M ${pt.x} ${pt.y}`);
          } else {
            res.push(`L ${pt.x} ${pt.y}`);
          }
        } else {
          const bz = pts[j] as BezierCurve;
          const pts1 = bz.anchors;

          if (j === 0) {
            res.push(`M ${pts1[0].x} ${pts1[0].y}`);
          } else {
            res.push(`L ${pts1[0].x} ${pts1[0].y}`);
          }

          if (pts1.length === 3) {
            res.push(`Q ${pts1[1].x} ${pts1[1].y} ${pts1[2].x} ${pts1[2].y}`);
            // ctx.quadraticCurveTo(pts1[1].x, pts1[1].y, pts1[2].x, pts1[2].y);
          } else {
            // ctx.bezierCurveTo(pts1[1].x, pts1[1].y, pts1[2].x, pts1[2].y, pts1[3].x, pts1[3].y);
          }
        }
      }

      res.push("Z");

      return res.join(" ");
    };

    let drawFace = (bx: number, by: number, fn: FaceName[]) => {
      let rx = bx * BOX + BOX_OFFSET;
      let ry = by * BOX + BOX_OFFSET;
      let BX = BOX * BOX_FACTOR;
      let BX2 = BX / 2;
      let cols = fn.map(c => STANDARD_PALETTE[FACE_COLOR[c]]);

      return `
      <path stroke="black" stroke-width="2" fill="${cols[0]}" d="${getRoundedPath([
        [rx, ry],
        [rx, ry + BX2],
        [rx + BX2, ry],
      ])}" />
      <path stroke="black" stroke-width="2" fill="${cols[1]}" d="${getRoundedPath([
        [rx + BX2, ry],
        [rx + BX, ry + BX2],
        [rx + BX, ry],
      ])}" />
      <path stroke="black" stroke-width="2" fill="${cols[2]}" d="${getRoundedPath([
        [rx + BX, ry + BX2],
        [rx + BX2, ry + BX],
        [rx + BX, ry + BX],
      ])}" />
      <path stroke="black" stroke-width="2" fill="${cols[3]}" d="${getRoundedPath([
        [rx + BX2, ry + BX],
        [rx, ry + BX2],
        [rx, ry + BX],
      ])}" />
      <path stroke="black" stroke-width="2" fill="${cols[4]}" d="${getRoundedPath([
        [rx + BX2, ry],
        [rx + BX, ry + BX2],
        [rx + BX2, ry + BX],
        [rx, ry + BX2],
      ])}" />
      `;
    };

    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <svg xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin">
      ${drawFace(1, 0, faces.U)}
      ${drawFace(0, 1, faces.L)}
      ${drawFace(1, 1, faces.F)}
      ${drawFace(2, 1, faces.R)}
      ${drawFace(3, 1, faces.B)}
      ${drawFace(1, 2, faces.D)}
    </svg>`;
  };

  skewb.faceVectors = [UP, RIGHT, FRONT, DOWN, LEFT, BACK];

  assignColors(skewb, ["w", "r", "g", "y", "o", "b"]);

  return skewb;
}
