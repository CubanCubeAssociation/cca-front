import { RIGHT, LEFT, DOWN, FRONT } from "./../vector3d";
import { BACK, UP } from "../../classes/vector3d";
import type { PuzzleInterface } from "@interfaces";
import { STANDARD_PALETTE } from "@constants";
import { assignColors } from "./puzzleUtils";
import { getRoundedPath } from "@helpers/object";

export function SKEWB(): PuzzleInterface {
  const skewb: PuzzleInterface = {
    pieces: [],
    palette: STANDARD_PALETTE,
    faceVectors: [],
    move: () => true,
    roundParams: {},
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
      const times = ((dir % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        const NU = [faces.U[0], faces.F[2], ...pick(faces.U, [2, 3, 4])];
        const NR = [faces.R[0], ...faces.D.slice(1)];
        const NF = faces.F.map((v, p) => (p === 2 ? faces.L[3] : v));
        const ND = [faces.D[0], ...pick(faces.B, [2, 3, 0, 4])];
        const NL = faces.L.map((v, p) => (p === 3 ? faces.U[1] : v));
        const NB = pick(faces.R, [3, 0, 1, 2, 4]).map((v, p) => (p === 1 ? faces.B[1] : v));
        update(NU, NR, NF, ND, NL, NB);
      }
    },

    L: (dir: number) => {
      const times = ((dir % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        const NU = faces.U.map((v, p) => (p === 3 ? faces.B[2] : v));
        const NR = faces.R.map((v, p) => (p === 3 ? faces.U[3] : v));
        const NF = pick(faces.L, [3, 1, 1, 2, 4]).map((v, p) => (p === 1 ? faces.F[1] : v));
        const ND = pick(faces.F, [3, 0, 1, 2, 4]).map((v, p) => (p === 2 ? faces.D[2] : v));
        const NL = pick(faces.D, [0, 3, 0, 1, 4]).map((v, p) => (p === 0 ? faces.L[0] : v));
        const NB = faces.B.map((v, p) => (p === 2 ? faces.R[3] : v));
        update(NU, NR, NF, ND, NL, NB);
      }
    },

    U: (dir: number) => {
      const times = ((dir % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        const NU = pick(faces.B, [1, 2, 0, 0, 4]).map((v, p) => (p === 2 ? faces.U[2] : v));
        const NR = faces.R.map((v, p) => (p === 1 ? faces.D[3] : v));
        const NF = faces.F.map((v, p) => (p === 0 ? faces.R[1] : v));
        const ND = faces.D.map((v, p) => (p === 3 ? faces.F[0] : v));
        const NL = faces.U.map((v, p) => (p === 2 ? faces.L[2] : v));
        const NB = pick(faces.L, [3, 0, 1, 0, 4]).map((v, p) => (p === 3 ? faces.B[3] : v));
        update(NU, NR, NF, ND, NL, NB);
      }
    },

    B: (dir: number) => {
      const times = ((dir % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        const NU = faces.U.map((v, p) => (p === 0 ? faces.R[2] : v));
        const NR = faces.R.map((v, p) => (p === 2 ? faces.F[3] : v));
        const NF = faces.F.map((v, p) => (p === 3 ? faces.U[0] : v));
        const ND = faces.L.map((v, p) => (p === 1 ? faces.D[1] : v));
        const NL = pick(faces.B, [3, 0, 1, 2, 4]).map((v, p) => (p === 1 ? faces.L[1] : v));
        const NB = pick(faces.D, [0, 2, 3, 0, 4]).map((v, p) => (p === 0 ? faces.B[0] : v));
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

    const drawFace = (bx: number, by: number, fn: FaceName[]) => {
      const rx = bx * BOX + BOX_OFFSET;
      const ry = by * BOX + BOX_OFFSET;
      const BX = BOX * BOX_FACTOR;
      const BX2 = BX / 2;
      const cols = fn.map(c => STANDARD_PALETTE[FACE_COLOR[c]]);

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
