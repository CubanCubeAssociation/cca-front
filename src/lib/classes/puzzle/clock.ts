import { BACK, CENTER, DOWN, FRONT, Vector3D } from "@classes/vector3d";
import type { PuzzleInterface } from "@interfaces";
import { Sticker } from "./Sticker";

let lineWidth = 0.4;

function circle(
  parts: string[],
  x: number,
  y: number,
  rad: number,
  col: string,
  omitStroke = false
) {
  parts.push(
    `<circle cx="${x}" cy="${y}" r="${rad * 0.95}" fill="${col}" stroke-width="${lineWidth}"
      ${!omitStroke ? `stroke="${col}"` : ""} />`
  );
}

function drawSingleClock(
  parts: string[],
  RAD: number,
  X: number,
  Y: number,
  MAT: any,
  PINS: any,
  BLACK: string,
  WHITE: string,
  GRAY: string
) {
  const W = RAD * 0.582491582491582;
  const RAD_CLOCK = RAD * 0.2020202020202;
  const BORDER = RAD * 0.0909090909090909;
  const BORDER1 = RAD * 0.02;

  const PI = Math.PI;
  const TAU = PI * 2;

  const arrow = new Sticker([
    new Vector3D(0.0, 1.0),
    new Vector3D(0.1491, 0.4056),
    new Vector3D(0.0599, 0.2551),
    new Vector3D(0.0, 0.0),
    new Vector3D(-0.0599, 0.2551),
    new Vector3D(-0.1491, 0.4056),
  ]).mul(RAD_CLOCK);

  const circles = new Sticker([new Vector3D(0.1672), new Vector3D(0.1254)]).mul(RAD_CLOCK);

  const R_PIN = circles.points[0].x * 2.3;
  lineWidth = 0.4;

  circle(parts, X, Y, RAD, WHITE);

  for (let i = -1; i < 2; i += 2) {
    for (let j = -1; j < 2; j += 2) {
      circle(parts, X + W * i, Y + W * j, RAD_CLOCK + BORDER + BORDER1, WHITE);
      circle(parts, X + W * i, Y + W * j, RAD_CLOCK + BORDER, BLACK);
    }
  }

  circle(parts, X, Y, RAD - BORDER1, BLACK);

  for (let i = -1; i < 2; i += 1) {
    for (let j = -1; j < 2; j += 1) {
      circle(parts, X + W * i, Y + W * j, RAD_CLOCK, WHITE);

      const ANCHOR = new Vector3D(X + W * i, Y + W * j);
      const angId = MAT[j + 1][i + 1];
      const ang = (angId * TAU) / 12;
      const pts = arrow.rotate(CENTER, FRONT, PI + ang).add(ANCHOR).points;
      const pathParts: string[] = [];

      lineWidth = 0.2;

      for (let p = 0, maxp = pts.length; p < maxp; p += 1) {
        if (p === 0) pathParts.push(`M ${pts[p].x} ${pts[p].y}`);
        else pathParts.push(`L ${pts[p].x} ${pts[p].y}`);
      }
      pathParts.push("Z");
      parts.push(
        `<path d="${pathParts.join(" ")}" stroke="${BLACK}" stroke-width="${0.2}" fill="${BLACK}" />`
      );

      lineWidth = 0.4;

      circle(parts, ANCHOR.x, ANCHOR.y, circles.points[0].x, BLACK);
      circle(parts, ANCHOR.x, ANCHOR.y, circles.points[1].x, WHITE);

      for (let a = 0; a < 12; a += 1) {
        const pt = ANCHOR.add(DOWN.mul(RAD_CLOCK + BORDER / 2).rotate(CENTER, FRONT, (a * TAU) / 12));
        const r = (circles.points[0].x / 4) * (a ? 1 : 1.6);
        const c = a ? WHITE : "#ff0000";
        circle(parts, pt.x, pt.y, r, c);
      }

      if (i <= 0 && j <= 0) {
        const val = PINS[(j + 1) * 2 + i + 1];
        circle(parts, ANCHOR.x + W / 2, ANCHOR.y + W / 2, R_PIN, GRAY);
        circle(parts, ANCHOR.x + W / 2, ANCHOR.y + W / 2, R_PIN * 0.7, val ? "#181818" : GRAY);
      }
    }
  }
}

function clockImage(cube: PuzzleInterface, DIM: number) {
  const W = DIM * 2.2;
  const PINS1 = cube.raw[0];
  const PINS2 = cube.raw[0].map((e: any, p: number) => !PINS1[((p >> 1) << 1) + 1 - (p & 1)]);
  const MAT = cube.raw[1];
  const RAD = DIM / 2;

  const BLACK = cube.palette.black;
  const WHITE = cube.palette.white;
  const GRAY = cube.palette.gray;

  const parts: string[] = [];

  drawSingleClock(parts, RAD, RAD, RAD, MAT[0], PINS2, BLACK, WHITE, GRAY);
  drawSingleClock(parts, RAD, W - RAD, RAD, MAT[1], PINS1, WHITE, BLACK, GRAY);

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 ${W} ${DIM}">
  ${parts.join("")}
</svg>`;
}

export function CLOCK(): PuzzleInterface {
  const clock: PuzzleInterface = {
    faceVectors: [FRONT, BACK],
    move: () => true,
    palette: {
      black: "#181818",
      white: "#aaa",
      gray: "#7f7f7f",
    },
    pieces: [],
    roundParams: {},
    isRounded: true,
  };

  const pins: boolean[] = [false, false, false, false];
  const clocks = [
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  ];

  const add = function (i: number, j: number, k: number, val: number) {
    clocks[i][j][k] = (((clocks[i][j][k] + val) % 12) + 12) % 12;
  };

  const mat = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  clock.move = function (moves: any[]) {
    let first = true;
    let upFace = 0;
    for (let i = 0, maxi = moves.length; i < maxi; i += 1) {
      const mv = moves[i];
      const pinCode = mv[0];
      const up = mv[1];
      const down = mv[2];

      if (mv[0] === -1) {
        upFace ^= 1;
        continue;
      }

      for (let x = 0; x < 3; x += 1) {
        for (let y = 0; y < 3; y += 1) {
          mat[x][y] = 0;
        }
      }

      for (let j = 0, mask = 8; j < 4; j += 1, mask >>= 1) {
        if (isNaN(up) || isNaN(down)) {
          if (first) {
            pins.length = 0;
            pins.push(false, false, false, false);
            first = false;
          }
          pins[j] = pinCode & mask ? true : pins[j];
        } else {
          pins[j] = !!(pinCode & mask);
        }
        if (pins[j]) {
          const x = j >> 1;
          const y = j & 1;
          mat[x][y] = mat[x + 1][y] = mat[x][y + 1] = mat[x + 1][y + 1] = 1;
        }
      }

      if (!isNaN(up) && !isNaN(down)) {
        for (let x = 0; x < 3; x += 1) {
          for (let y = 0; y < 3; y += 1) {
            if (mat[x][y]) {
              add(upFace, x, y, up);
              if ((x & 1) == 0 && (y & 1) == 0) {
                add(1 - upFace, x, 2 - y, -up);
              }
            }
          }
        }
      }
    }
  };

  clock.getImage = () => clockImage(clock, 100);

  clock.raw = [pins, clocks];

  return clock;
}
