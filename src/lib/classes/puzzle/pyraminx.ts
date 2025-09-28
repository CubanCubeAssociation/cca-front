import { STANDARD_PALETTE } from "@constants";
import type { PuzzleInterface } from "@interfaces";

export function PYRAMINX(): PuzzleInterface {
  const pyra: PuzzleInterface = {
    palette: STANDARD_PALETTE,
    move: () => true,
    roundParams: {},
  };

  type FaceName = "F" | "R" | "L" | "D";
  const faces: Record<FaceName, FaceName[]> = {
    F: ["F", "F", "F", "F", "F", "F", "F", "F", "F"],
    R: ["R", "R", "R", "R", "R", "R", "R", "R", "R"],
    L: ["L", "L", "L", "L", "L", "L", "L", "L", "L"],
    D: ["D", "D", "D", "D", "D", "D", "D", "D", "D"],
  };

  function update(NF: FaceName[], NR: FaceName[], NL: FaceName[], ND: FaceName[]) {
    faces.F = NF;
    faces.R = NR;
    faces.L = NL;
    faces.D = ND;
  }

  // URLB
  const cycles = {
    U: (count: number) => {
      let times = ((count % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        let NF = [0, -1, -1, 3, -1, 5, 6, -1, -1].map((v, p) => (v < 0 ? faces.F[p] : faces.R[v]));
        let NR = [1, -1, -1, 4, -1, 3, 7, -1, -1].map((v, p) => (v < 0 ? faces.R[p] : faces.L[v]));
        let NL = [-1, 0, -1, 5, 3, -1, -1, 6, -1].map((v, p) => (v < 0 ? faces.L[p] : faces.F[v]));
        let ND = [...faces.D];
        update(NF, NR, NL, ND);
      }
    },
    R: (count: number) => {
      let times = ((count % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        let NF = [-1, -1, 0, -1, 5, 3, -1, -1, 6].map((v, p) => (v < 0 ? faces.F[p] : faces.D[v]));
        let NR = [-1, 2, -1, 4, 5, -1, -1, 8, -1].map((v, p) => (v < 0 ? faces.R[p] : faces.F[v]));
        let NL = [...faces.L];
        let ND = [1, -1, -1, 4, -1, 3, 7, -1, -1].map((v, p) => (v < 0 ? faces.D[p] : faces.R[v]));
        update(NF, NR, NL, ND);
      }
    },
    L: (count: number) => {
      let times = ((count % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        let NF = [-1, 0, -1, 5, 3, -1, -1, 6, -1].map((v, p) => (v < 0 ? faces.F[p] : faces.L[v]));
        let NR = [...faces.R];
        let NL = [1, -1, -1, 4, -1, 3, 7, -1, -1].map((v, p) => (v < 0 ? faces.L[p] : faces.D[v]));
        let ND = [-1, 1, -1, 3, 4, -1, -1, 7, -1].map((v, p) => (v < 0 ? faces.D[p] : faces.F[v]));
        update(NF, NR, NL, ND);
      }
    },
    B: (count: number) => {
      let times = ((count % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        let NF = [...faces.F];
        let NR = [-1, -1, 2, -1, 4, 5, -1, -1, 8].map((v, p) => (v < 0 ? faces.R[p] : faces.D[v]));
        let NL = [-1, -1, 2, -1, 4, 5, -1, -1, 8].map((v, p) => (v < 0 ? faces.L[p] : faces.R[v]));
        let ND = [-1, -1, 2, -1, 4, 5, -1, -1, 8].map((v, p) => (v < 0 ? faces.D[p] : faces.L[v]));
        update(NF, NR, NL, ND);
      }
    },
    u: (count: number) => {
      let times = ((count % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        let NF = faces.F.map((v, p) => (p === 0 ? faces.R[0] : v));
        let NR = faces.R.map((v, p) => (p === 0 ? faces.L[1] : v));
        let NL = faces.L.map((v, p) => (p === 1 ? faces.F[0] : v));
        let ND = [...faces.D];
        update(NF, NR, NL, ND);
      }
    },
    r: (count: number) => {
      let times = ((count % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        let NF = faces.F.map((v, p) => (p === 2 ? faces.D[0] : v));
        let NR = faces.R.map((v, p) => (p === 1 ? faces.F[2] : v));
        let NL = [...faces.L];
        let ND = faces.D.map((v, p) => (p === 0 ? faces.R[1] : v));
        update(NF, NR, NL, ND);
      }
    },
    l: (count: number) => {
      let times = ((count % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        let NF = faces.F.map((v, p) => (p === 1 ? faces.L[0] : v));
        let NR = [...faces.R];
        let NL = faces.L.map((v, p) => (p === 0 ? faces.D[1] : v));
        let ND = faces.D.map((v, p) => (p === 1 ? faces.F[1] : v));
        update(NF, NR, NL, ND);
      }
    },
    b: (count: number) => {
      let times = ((count % 3) + 3) % 3;
      for (let i = 0; i < times; i += 1) {
        let NF = [...faces.F];
        let NR = faces.R.map((v, p) => (p === 2 ? faces.D[2] : v));
        let NL = faces.L.map((v, p) => (p === 2 ? faces.R[2] : v));
        let ND = faces.D.map((v, p) => (p === 2 ? faces.L[2] : v));
        update(NF, NR, NL, ND);
      }
    },
  };

  pyra.move = (moves: any[]) => {
    moves.forEach(mv => {
      if (mv[0] === 0) {
        (mv[2] === 2 ? cycles.U : cycles.u)(-mv[1]);
      } else if (mv[0] === 1) {
        (mv[2] === 2 ? cycles.R : cycles.r)(-mv[1]);
      } else if (mv[0] === 2) {
        (mv[2] === 2 ? cycles.L : cycles.l)(-mv[1]);
      } else if (mv[0] === 3) {
        (mv[2] === 2 ? cycles.B : cycles.b)(-mv[1]);
      }
    });
  };

  const lookup: Record<FaceName, number> = {
    F: 0,
    D: 1,
    L: 2,
    R: 3,
  };

  function getClass(fc: FaceName) {
    return "c" + lookup[fc];
  }

  pyra.getImage = () => {
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 1000 879.9999999999999" class="NzJiZmJlZDYtZjgx">
  <style>.NzJiZmJlZDYtZjgx .c0{fill:#009d54ff;stroke:black;stroke-width:5;stroke-linecap:square;}.NzJiZmJlZDYtZjgx .c1{fill:#ffeb3bff;stroke:black;stroke-width:5;stroke-linecap:square;}.NzJiZmJlZDYtZjgx .c2{fill:#dc422fff;stroke:black;stroke-width:5;stroke-linecap:square;}.NzJiZmJlZDYtZjgx .c3{fill:#3d81f6ff;stroke:black;stroke-width:5;stroke-linecap:square;}</style>
  <path class="${getClass(faces.F[0])}" d="M508.32,37.49Q500 23.11,491.67 37.49L432.67,139.47Q424.35 153.85,440.99 153.85L559,153.85Q575.64 153.85,567.32 139.47Z" />
  <path class="${getClass(faces.F[1])}" d="M344.76,320.17Q336.44 305.79,328.12 320.17L269.12,422.15Q260.8 436.53,277.44 436.53L395.44,436.53Q412.09 436.53,403.77 422.15Z" />
  <path class="${getClass(faces.F[2])}" d="M671.87,320.17Q663.55 305.79,655.23 320.17L596.22,422.15Q587.9 436.53,604.55 436.53L722.55,436.53Q739.19 436.53,730.87 422.15Z" />
  <path class="${getClass(faces.F[3])}" d="M426.54,178.83Q418.22 164.45,409.9 178.83L350.9,280.81Q342.58 295.19,359.22 295.19L477.22,295.19Q493.86 295.19,485.54 280.81Z" />
  <path class="${getClass(faces.F[4])}" d="M508.32,320.17Q500 305.79,491.67 320.17L432.67,422.15Q424.35 436.53,440.99 436.53L559,436.53Q575.64 436.53,567.32 422.15Z" />
  <path class="${getClass(faces.F[5])}" d="M590.09,178.83Q581.77 164.45,573.45 178.83L514.45,280.81Q506.13 295.19,522.77 295.19L640.77,295.19Q657.41 295.19,649.09 280.81Z" />
  <path class="${getClass(faces.F[6])}" d="M440.99,160.92Q424.35 160.92,432.67 175.3L491.67,277.27Q500 291.66,508.32 277.27L567.32,175.3Q575.64 160.92,559 160.92Z" />
  <path class="${getClass(faces.F[7])}" d="M359.22,302.26Q342.58 302.26,350.9 316.64L409.9,418.61Q418.22 433,426.54 418.61L485.54,316.64Q493.86 302.26,477.22 302.26Z" />
  <path class="${getClass(faces.F[8])}" d="M522.77,302.26Q506.13 302.26,514.45 316.64L573.45,418.61Q581.77 433,590.09 418.61L649.09,316.64Q657.41 302.26,640.77 302.26Z" />

  <path class="${getClass(faces.D[0])}" d="M655.23,584.53Q663.55 598.94,671.87 584.53L730.87,482.34Q739.19 467.92,722.55 467.92L604.55,467.92Q587.9 467.92,596.22 482.34Z" />
  <path class="${getClass(faces.D[1])}" d="M328.12,584.53Q336.44 598.94,344.76 584.53L403.77,482.34Q412.09 467.92,395.44 467.92L277.44,467.92Q260.8 467.92,269.12 482.34Z" />
  <path class="${getClass(faces.D[2])}" d="M491.67,867.81Q500 882.22,508.32 867.81L567.32,765.61Q575.64 751.2,559 751.2L440.99,751.2Q424.35 751.2,432.67 765.61Z" />
  <path class="${getClass(faces.D[3])}" d="M491.67,584.53Q500 598.94,508.32 584.53L567.32,482.34Q575.64 467.92,559 467.92L440.99,467.92Q424.35 467.92,432.67 482.34Z" />
  <path class="${getClass(faces.D[4])}" d="M409.9,726.17Q418.22 740.58,426.54 726.17L485.54,623.97Q493.86 609.56,477.22 609.56L359.22,609.56Q342.58 609.56,350.9 623.97Z" />
  <path class="${getClass(faces.D[5])}" d="M573.45,726.17Q581.77 740.58,590.09 726.17L649.09,623.97Q657.41 609.56,640.77 609.56L522.77,609.56Q506.13 609.56,514.45 623.97Z" />
  <path class="${getClass(faces.D[6])}" d="M640.77,602.48Q657.41 602.48,649.09 588.07L590.09,485.88Q581.77 471.46,573.45 485.88L514.45,588.07Q506.13 602.48,522.77 602.48Z" />
  <path class="${getClass(faces.D[7])}" d="M477.22,602.48Q493.86 602.48,485.54 588.07L426.54,485.88Q418.22 471.46,409.9 485.88L350.9,588.07Q342.58 602.48,359.22 602.48Z" />
  <path class="${getClass(faces.D[8])}" d="M559,744.12Q575.64 744.12,567.32 729.71L508.32,627.52Q500 613.1,491.67 627.52L432.67,729.71Q424.35 744.12,440.99 744.12Z" />
  
  <path class="${getClass(faces.L[0])}" d="M226.58,404.02Q234.87 418.32,243.19 403.94L302.19,301.96Q310.51 287.58,293.9 287.66L176.08,288.2Q159.47 288.27,167.76 302.58Z" />
  <path class="${getClass(faces.L[1])}" d="M390.13,121.34Q398.42 135.64,406.74 121.26L465.74,19.28Q474.06 4.9,457.45 4.98L339.63,5.52Q323.02 5.59,331.31 19.9Z" />
  <path class="${getClass(faces.L[2])}" d="M63.54,122.83Q71.84 137.14,80.16 122.76L139.16,20.78Q147.48 6.4,130.87 6.47L13.05,7.01Q-3.56 7.09,4.73 21.4Z" />
  <path class="${getClass(faces.L[3])}" d="M308.35,262.68Q316.65 276.98,324.97 262.6L383.97,160.62Q392.29 146.24,375.67 146.32L257.86,146.86Q241.24 146.93,249.54 161.24Z" />
  <path class="${getClass(faces.L[4])}" d="M226.84,122.08Q235.13 136.39,243.45 122.01L302.45,20.03Q310.77 5.65,294.16 5.73L176.34,6.27Q159.73 6.34,168.02 20.65Z" />
  <path class="${getClass(faces.L[5])}" d="M145.06,263.42Q153.36 277.73,161.68 263.35L220.68,161.37Q229 146.99,212.38 147.07L94.57,147.61Q77.95 147.68,86.25 161.99Z" />
  <path class="${getClass(faces.L[6])}" d="M293.91,280.61Q310.52 280.53,302.23 266.23L243.41,164.79Q235.12 150.49,226.8 164.87L167.8,266.84Q159.48 281.23,176.09 281.15Z" />
  <path class="${getClass(faces.L[7])}" d="M375.68,139.27Q392.3 139.19,384 124.89L325.19,23.45Q316.89 9.15,308.57 23.53L249.57,125.5Q241.25 139.89,257.87 139.81Z" />
  <path class="${getClass(faces.L[8])}" d="M212.39,140.02Q229 139.94,220.71 125.64L161.9,24.2Q153.6 9.89,145.28 24.28L86.28,126.25Q77.96 140.63,94.57 140.56Z" />
  
  <path class="${getClass(faces.R[0])}" d="M593.25,121.26Q601.57 135.64,609.86 121.34L668.68,19.9Q676.97 5.59,660.36 5.52L542.54,4.98Q525.93 4.9,534.25 19.28Z" />
  <path class="${getClass(faces.R[1])}" d="M756.8,403.94Q765.12 418.32,773.41 404.02L832.23,302.58Q840.52 288.27,823.91 288.2L706.09,287.66Q689.48 287.58,697.8 301.96Z" />
  <path class="${getClass(faces.R[2])}" d="M919.83,122.76Q928.15 137.14,936.45 122.83L995.26,21.4Q1003.55 7.09,986.94 7.01L869.12,6.47Q852.51 6.4,860.83 20.78Z" />
  <path class="${getClass(faces.R[3])}" d="M675.02,262.6Q683.34 276.98,691.64 262.68L750.45,161.24Q758.75 146.93,742.13 146.86L624.32,146.32Q607.7 146.24,616.02 160.62Z" />
  <path class="${getClass(faces.R[4])}" d="M838.31,263.35Q846.63 277.73,854.93 263.42L913.74,161.99Q922.04 147.68,905.42 147.61L787.61,147.07Q770.99 146.99,779.31 161.37Z" />
  <path class="${getClass(faces.R[5])}" d="M756.54,122.01Q764.86 136.39,773.15 122.08L831.97,20.65Q840.26 6.34,823.65 6.27L705.83,5.73Q689.22 5.65,697.54 20.03Z" />
  <path class="${getClass(faces.R[6])}" d="M742.12,139.81Q758.74 139.89,750.42 125.5L691.42,23.53Q683.1 9.15,674.8 23.45L615.99,124.89Q607.69 139.19,624.31 139.27Z" />
  <path class="${getClass(faces.R[7])}" d="M823.9,281.15Q840.51 281.23,832.19 266.84L773.19,164.87Q764.87 150.49,756.58 164.79L697.76,266.23Q689.47 280.53,706.08 280.61Z" />
  <path class="${getClass(faces.R[8])}" d="M905.42,140.56Q922.03 140.63,913.71 126.25L854.71,24.28Q846.39 9.89,838.09 24.2L779.28,125.64Q770.99 139.94,787.6 140.02Z" />
</svg>`;
  };

  return pyra;
}

// import { Vector3D, UP, DOWN, FRONT, CENTER, RIGHT, LEFT } from "../vector3d";
// import { Sticker } from "./Sticker";
// import { Piece } from "./Piece";
// import type { PuzzleInterface } from "@interfaces";
// import { EPS, STANDARD_PALETTE } from "@constants";
// import { SVGGenerator } from "@helpers/imageGenerators/classes/SVGGenerator";
// import { assignColors, getAllStickers, roundCorners } from "./puzzleUtils";
// import { drawStickers } from "@helpers/drawSticker";

// export function PYRAMINX(n: number): PuzzleInterface {
//   const pyra: PuzzleInterface = {
//     palette: STANDARD_PALETTE,
//     move: () => true,
//     roundParams: {},
//     getImage: () => "",
//   };

//   const PI = Math.PI;
//   const PI_3 = PI / 3;
//   const L = 2.6;
//   const V = L / Math.sqrt(3);
//   const H = Math.sqrt(L ** 2 - V ** 2);
//   const R = (Math.sqrt(6) * L) / 12;
//   const PU = UP.mul(H - R);
//   const PR = DOWN.mul(R).add(FRONT.mul(V)).rotate(CENTER, UP, PI_3);
//   const PB = PR.rotate(CENTER, UP, 2 * PI_3);
//   const PL = PB.rotate(CENTER, UP, 2 * PI_3);

//   const pieces: Piece[] = [];

//   const ANCHORS = [PU, PR, PB, PL];

//   /// front, right, down, left
//   const UNITS = [
//     [PL.sub(PU).div(n), PR.sub(PL).div(n)], // front
//     [PB.sub(PR).div(n), PU.sub(PB).div(n)], // right (back)
//     [PR.sub(PB).div(n), PL.sub(PR).div(n)], // down
//     [PU.sub(PL).div(n), PB.sub(PU).div(n)], // left (back)
//   ];

//   const faceVectors = [
//     UNITS[0][0].cross(UNITS[0][1]).unit(),
//     UNITS[1][0].cross(UNITS[1][1]).unit(),
//     UNITS[2][0].cross(UNITS[2][1]).unit(),
//     UNITS[3][0].cross(UNITS[3][1]).unit(),
//   ];

//   pyra.faceVectors = faceVectors;

//   const createPiece = function (v1: Vector3D, v2: Vector3D, v3: Vector3D): Piece {
//     const pts = [v1, v2, v3];
//     const v = pts[2]
//       .sub(pts[1])
//       .cross(pts[1].sub(pts[0]))
//       .unit()
//       .mul(H / n);
//     const c = pts
//       .reduce((ac, vc) => ac.add(vc), new Vector3D(0, 0, 0))
//       .div(3)
//       .add(v);

//     return new Piece([new Sticker(pts), new Sticker([c, c, c])]);
//   };

//   for (let f = 0; f < 4; f += 1) {
//     for (let i = 0; i < n; i += 1) {
//       for (let j = 0; j <= i; j += 1) {
//         pieces.push(
//           createPiece(
//             ANCHORS[f].add(UNITS[f][0].mul(i).add(UNITS[f][1].mul(j))),
//             ANCHORS[f].add(UNITS[f][0].mul(i + 1).add(UNITS[f][1].mul(j))),
//             ANCHORS[f].add(UNITS[f][0].mul(i + 1).add(UNITS[f][1].mul(j + 1)))
//           )
//         );

//         if (j < i) {
//           pieces.push(
//             createPiece(
//               ANCHORS[f].add(UNITS[f][0].mul(i).add(UNITS[f][1].mul(j))),
//               ANCHORS[f].add(UNITS[f][0].mul(i + 1).add(UNITS[f][1].mul(j + 1))),
//               ANCHORS[f].add(UNITS[f][0].mul(i).add(UNITS[f][1].mul(j + 1)))
//             )
//           );
//         }
//       }
//     }
//   }

//   const planes = [
//     [PL, PB, PR], // D plane
//     [PL, PU, PB], // L plane
//     [PR, PB, PU], // R plane
//     [PR, PU, PL], // F plane
//   ];

//   const len = PU.sub(PL).div(n).y;

//   pieces.forEach(p => p.stickers.forEach(s => (s.vecs = faceVectors.map(v => v.clone()))));

//   const trySingleMove = (mv: any): { pieces: Piece[]; u: Vector3D; ang: number } | null => {
//     const moveId = mv[0];
//     const turns = mv[1];
//     const layers = mv[2];
//     const direction = mv[3];
//     const pts1 = planes[moveId];
//     const u = Vector3D.cross(pts1[0], pts1[1], pts1[2]).unit();
//     const mu = u.mul(-1);
//     const pts2 = pts1.map(p => p.add(mu.mul(len * (n - layers))));
//     const ang = ((2 * Math.PI) / 3) * turns;

//     const pcs = [];

//     for (let i = 0, maxi = pieces.length; i < maxi; i += 1) {
//       const d = pieces[i].direction1(pts2[0], u, false, (s: Sticker) => !/^[xd]$/.test(s.color));

//       if (d * direction < 0) {
//         pcs.push(pieces[i]);
//       }
//     }

//     return {
//       pieces: pcs,
//       u: mu,
//       ang,
//     };
//   };

//   /// [ id, turns, layers, direction ]
//   pyra.move = function (moves: any[]) {
//     for (let m = 0, maxm = moves.length; m < maxm; m += 1) {
//       const mv = moves[m];
//       const pcs = trySingleMove(mv);

//       if (!pcs) {
//         return false;
//       }

//       const { u, ang } = pcs;
//       pcs.pieces.forEach(p => p.rotate(CENTER, u, ang, true));
//     }
//     return true;
//   };

//   pyra.getImage = () => {
//     const DIM = 100;
//     let W = (DIM * 4) / 2;
//     let H = W / 1.1363636363636365;
//     const FACTOR = 2.1;
//     let LW = DIM * 0.007;
//     const PI_2 = Math.PI / 2;

//     roundCorners({ p: pyra, ...pyra.roundParams, calcPath: true });

//     // Set dimensions

//     const ctx = new SVGGenerator(W, H);
//     ctx.lineWidth = LW;

//     let colorFilter = ["d"];

//     const stickers = getAllStickers(pieces).filter(s => {
//       return colorFilter.indexOf(s.color) === -1;
//     });

//     const sideStk: { [name: string]: Sticker[] } = {};

//     let faceName = ["F", "R", "D", "L"];
//     let fcTr: any[] = [
//       [CENTER, RIGHT, PI_2, UP, FACTOR],
//       [CENTER, UP, -PI_2, RIGHT, FACTOR],
//       [CENTER, RIGHT, 0, UP, 0], /// F = no transform
//       [CENTER, LEFT, PI_2, DOWN, FACTOR],
//       [CENTER, UP, PI_2, LEFT, FACTOR],
//       [CENTER, UP, PI, RIGHT, FACTOR * 2],
//     ];

//     for (let i = 0, maxi = faceName.length; i < maxi; i += 1) {
//       sideStk[faceName[i]] = [];
//     }

//     for (let i = 0, maxi = stickers.length; i < maxi; i += 1) {
//       const st = stickers[i];
//       let uv = st.getOrientation();

//       for (let j = 0, maxj = faceVectors.length; j < maxj; j += 1) {
//         if (faceVectors[j].sub(uv).abs() < EPS) {
//           sideStk[faceName[j]].push(st);
//         }
//       }
//     }

//     const PU = UP.mul(1.59217);
//     const PR = DOWN.mul(0.53072).add(FRONT.mul(1.5011)).rotate(CENTER, UP, PI_3);
//     const PB = PR.rotate(CENTER, UP, 2 * PI_3);
//     const PL = PB.rotate(CENTER, UP, 2 * PI_3);
//     const MLR = PL.add(PR).div(2);

//     const ANG = 0.4048928432892675;
//     const ANG1 = PI_2 + ANG;

//     sideStk.F.forEach(s => s.rotate(MLR, RIGHT, ANG, true));
//     sideStk.R.forEach(s => s.rotate(PR, PR.sub(PU), ANG1, true).rotate(MLR, RIGHT, ANG, true));
//     sideStk.D.forEach(s => s.rotate(PR, PL.sub(PR), ANG1, true).rotate(MLR, RIGHT, ANG, true));
//     sideStk.L.forEach(s => s.rotate(PU, PU.sub(PL), ANG1, true).rotate(MLR, RIGHT, ANG, true));

//     const cm1 = sideStk.R.reduce((a, s) => a.add(s.getMassCenter(), true), new Vector3D())
//       .div(sideStk.R.length, true)
//       .setLength(0.15);
//     const cm2 = sideStk.D.reduce((a, s) => a.add(s.getMassCenter(), true), new Vector3D())
//       .div(sideStk.D.length, true)
//       .setLength(0.15);
//     const cm3 = sideStk.L.reduce((a, s) => a.add(s.getMassCenter(), true), new Vector3D())
//       .div(sideStk.L.length, true)
//       .setLength(0.15);

//     sideStk.R.forEach(s => s.add(cm1, true));
//     sideStk.D.forEach(s => s.add(cm2, true));
//     sideStk.L.forEach(s => s.add(cm3, true));

//     const allStickers: Sticker[] = [];

//     for (let i = 0, maxi = faceName.length; i < maxi; i += 1) {
//       allStickers.push(...sideStk[faceName[i]]);
//     }

//     drawStickers(ctx, allStickers, [], W, H, "pyraminx", pyra);

//     return ctx.getImage();
//   };

//   pyra.pieces = pieces;

//   assignColors(pyra, ["g", "b", "y", "r"]);

//   return pyra;
// }
