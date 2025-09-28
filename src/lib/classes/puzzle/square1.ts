import { RIGHT, LEFT, BACK, UP, FRONT, DOWN } from "./../vector3d";
import type { PuzzleInterface } from "@interfaces";
import { EPS, STANDARD_PALETTE } from "@constants";
import { Sticker } from "./Sticker";
import { getRoundedPath } from "@helpers/object";
import { Vector2D } from "@classes/vector2-d";

export function SQUARE1(): PuzzleInterface {
  const sq1: PuzzleInterface = {
    pieces: [],
    palette: STANDARD_PALETTE,
    faceVectors: [],
    move: () => true,
    roundParams: {
      rd: (s: Sticker, i: number) => {
        const o = s.getOrientation();

        if (o.cross(UP).abs() < EPS) {
          if (s.points.length === 3) return i === 1 ? [0.25] : 0.11;
          return i === 2 ? [0.2] : 0.11;
        }

        if (s.name === "side-equator") {
          return [0.05, true];
        }

        if (s.name === "side-corner") {
          return i === 2 ? [0.2, true] : [0.05, true];
        }

        if (s.name === "side-edge") {
          return i === 1 || i === 2 ? [0.2, true] : [0.05, true];
        }

        return i === 1 || i === 2 ? [0.2, true] : [0.05, true];
      },
      scale: 0.95,
    },
  };

  type FaceName = "U" | "R" | "F" | "D" | "L" | "B";

  interface SQPiece {
    l: 1 | 2;
    c: FaceName[];
  }

  const faces: Record<string, SQPiece[]> = {
    U: [
      { l: 2, c: ["U", "L", "F"] }, // Start with the front-left piece of the / clockwise
      { l: 1, c: ["U", "L"] },
      { l: 2, c: ["U", "B", "L"] },
      { l: 1, c: ["U", "B"] },
      { l: 2, c: ["U", "R", "B"] },
      { l: 1, c: ["U", "R"] },
      { l: 2, c: ["U", "F", "R"] },
      { l: 1, c: ["U", "F"] },
    ],
    E: [{ l: 1, c: ["F"] }],
    D: [
      { l: 2, c: ["D", "F", "L"] },
      { l: 1, c: ["D", "L"] },
      { l: 2, c: ["D", "L", "B"] },
      { l: 1, c: ["D", "B"] },
      { l: 2, c: ["D", "B", "R"] },
      { l: 1, c: ["D", "R"] },
      { l: 2, c: ["D", "R", "F"] },
      { l: 1, c: ["D", "F"] },
    ],
  };

  const cycles = {
    slash: () => {
      let pos1 = 0;
      let pos2 = 0;
      const UF = faces.U;
      const DF = faces.D;

      for (let i = 0, acc = 0, maxi = UF.length; i < maxi; i += 1) {
        acc += UF[i].l;
        if (acc === 6) {
          pos1 = i;
          break;
        }
      }
      for (let i = 0, acc = 0, maxi = DF.length; i < maxi; i += 1) {
        acc += DF[i].l;
        if (acc === 6) {
          pos2 = i;
          break;
        }
      }

      faces.E[0].l = faces.E[0].l === 1 ? 2 : 1;

      const topSlice = UF.slice(pos1 + 1).reverse();
      const bottomSlice = DF.slice(pos2 + 1).reverse();

      faces.U = [...UF.slice(0, pos1 + 1), ...bottomSlice];
      faces.D = [...DF.slice(0, pos2 + 1), ...topSlice];
    },

    U: (count: number) => {
      const rcount = 12 - (((count % 12) + 12) % 12);
      const fc = faces.U;
      for (let i = 0, s = 0, maxi = fc.length; i < maxi; i += 1) {
        s += fc[i].l;
        if (s === rcount) {
          faces.U = [...faces.U.slice(i + 1), ...faces.U.slice(0, i + 1)];
          break;
        }
      }
    },
    D: (count: number) => {
      const rcount = ((count % 12) + 12) % 12;
      const fc = faces.D;
      for (let i = 0, s = 0, maxi = fc.length; i < maxi; i += 1) {
        s += fc[i].l;
        if (s === rcount) {
          faces.D = [...faces.D.slice(i + 1), ...faces.D.slice(0, i + 1)];
          break;
        }
      }
    },
  };

  sq1.move = function (moves: any[]) {
    moves.forEach(mv => {
      if (mv[0] === 0) cycles.slash();
      else if (mv[0] === 1) cycles.U(mv[1]);
      else if (mv[0] === 2) cycles.D(mv[1]);
    });
  };

  const colors: Record<FaceName, keyof typeof STANDARD_PALETTE> = {
    U: "white",
    R: "blue",
    F: "red",
    D: "yellow",
    L: "green",
    B: "orange",
  };

  function getColor(fc: FaceName): string {
    return STANDARD_PALETTE[colors[fc]];
  }

  sq1.getImage = () => {
    const W = 200;
    const W_2 = W / 2;
    const FACTOR = 0.5;
    const LFactor = 1.3;
    const L = W_2 * FACTOR;
    const R = L * Math.tan(Math.PI / 12);
    const EPath = (my: number) => [
      [W_2, W_2],
      [W_2 - R, W_2 + my * L],
      [W_2 + R, W_2 + my * L],
    ];
    const CPath = (my: number) => [
      [W_2, W_2],
      [W_2 - L, W_2 + my * R],
      [W_2 - L, W_2 + my * L],
      [W_2 - R, W_2 + my * L],
    ];

    const convertPath = (
      path: number[][],
      REF: Vector2D,
      OFF: number,
      OX: number,
      OY: number,
      my: number
    ): number[][] => {
      return path.map(c =>
        new Vector2D(c[0], c[1])
          .sub(REF)
          .rot(my * OFF)
          .add(new Vector2D(REF.x + OX, REF.y + OY))
          .toArr()
      );
    };

    const getFace = (fc: SQPiece[], OX: number, OY: number, my = 1) => {
      const REF = new Vector2D(W_2, W_2);
      const ANG = Math.PI / 6;
      const res: string[] = [];
      let acc = 0;

      for (let i = 0, maxi = fc.length; i < maxi; i += 1) {
        const pc = fc[i];
        const OFF = acc * ANG + (pc.l === 1 ? ANG : 0);
        const paths = [convertPath(pc.l === 1 ? EPath(my) : CPath(my), REF, OFF, OX, OY, my)];
        if (pc.l === 1) {
          const EP1 = EPath(my)
            .slice(1)
            .reverse()
            .map(c => new Vector2D(c[0], c[1]).sub(REF).mul(LFactor).add(REF).toArr());
          paths.push(convertPath([...EPath(my).slice(1), ...EP1], REF, OFF, OX, OY, my));
        } else {
          const pos = [
            [1, 3],
            [2, 4],
          ];

          if (my < 0) pos.reverse();

          pos.forEach(p => {
            const EP1 = CPath(my)
              .slice(p[0], p[1])
              .reverse()
              .map(c => new Vector2D(c[0], c[1]).sub(REF).mul(LFactor).add(REF).toArr());
            paths.push(convertPath([...CPath(my).slice(p[0], p[1]), ...EP1], REF, OFF, OX, OY, my));
          });
        }
        acc += pc.l;
        res.push(
          paths
            .map(
              (path, p) =>
                `<path d="${getRoundedPath(path, 0.15)}" fill="${getColor(fc[i].c[p])}" stroke="black" stroke-width="2" />`
            )
            .join("")
        );
      }

      return res.join("");
    };

    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 200 400" class="NzJiZmJlZDYtZjgx">
  ${getFace(faces.U, 0, 0)}
  ${getFace(faces.D, 0, W, -1)}
  <rect x="${W * 0.175}" y="${W * 0.95}" width="${W * 0.239}" height="${W * 0.09}"
    rx="${W * 0.02}" ry="${W * 0.02}" stroke="black" stroke-width="2" fill=${getColor("F")} />
  <rect x="${W * 0.414}" y="${W * 0.95}" width="${W * (faces.E[0].l & 1 ? 0.412 : 0.239)}" height="${W * 0.09}"
    rx="${W * 0.02}" ry="${W * 0.02}" stroke="black" stroke-width="2" fill=${faces.E[0].l & 1 ? getColor("F") : getColor("B")} />
</svg>`;
  };

  sq1.faceVectors = [UP, RIGHT, FRONT, DOWN, LEFT, BACK];

  return sq1;
}
