import { BACK, CENTER, DOWN, FRONT, Vector3D } from "@classes/vector3d";
import type { PuzzleInterface } from "@interfaces";
import { Sticker } from "./Sticker";
import { SVGGenerator } from "@helpers/imageGenerators/classes/SVGGenerator";

function circle(
  ctx: SVGGenerator,
  x: number,
  y: number,
  rad: number,
  col: string,
  omitStroke = false
) {
  ctx.fillStyle = col;
  if (!omitStroke) ctx.strokeStyle = col;
  ctx.circle(x, y, rad * 0.95);
}

function drawSingleClock(
  ctx: SVGGenerator,
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

  circle(ctx, X, Y, RAD, WHITE);

  for (let i = -1; i < 2; i += 2) {
    for (let j = -1; j < 2; j += 2) {
      circle(ctx, X + W * i, Y + W * j, RAD_CLOCK + BORDER + BORDER1, WHITE);
      circle(ctx, X + W * i, Y + W * j, RAD_CLOCK + BORDER, BLACK);
    }
  }

  circle(ctx, X, Y, RAD - BORDER1, BLACK);

  for (let i = -1; i < 2; i += 1) {
    for (let j = -1; j < 2; j += 1) {
      circle(ctx, X + W * i, Y + W * j, RAD_CLOCK, WHITE);

      const ANCHOR = new Vector3D(X + W * i, Y + W * j);
      let angId = MAT[j + 1][i + 1];
      let ang = (angId * TAU) / 12;
      let pts = arrow.rotate(CENTER, FRONT, PI + ang).add(ANCHOR).points;
      ctx.fillStyle = BLACK;
      ctx.strokeStyle = BLACK;
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      for (let p = 0, maxp = pts.length; p < maxp; p += 1) {
        p === 0 && ctx.moveTo(pts[p].x, pts[p].y);
        p > 0 && ctx.lineTo(pts[p].x, pts[p].y);
      }
      ctx.fill();
      ctx.stroke();
      ctx.closePath();

      ctx.lineWidth = 0.4;

      circle(ctx, ANCHOR.x, ANCHOR.y, circles.points[0].x, BLACK);
      circle(ctx, ANCHOR.x, ANCHOR.y, circles.points[1].x, WHITE);

      for (let a = 0; a < 12; a += 1) {
        let pt = ANCHOR.add(DOWN.mul(RAD_CLOCK + BORDER / 2).rotate(CENTER, FRONT, (a * TAU) / 12));
        let r = (circles.points[0].x / 4) * (a ? 1 : 1.6);
        let c = a ? WHITE : "#ff0000";
        circle(ctx, pt.x, pt.y, r, c);
      }

      if (i <= 0 && j <= 0) {
        let val = PINS[(j + 1) * 2 + i + 1];
        circle(ctx, ANCHOR.x + W / 2, ANCHOR.y + W / 2, R_PIN, val ? WHITE : GRAY);
        circle(ctx, ANCHOR.x + W / 2, ANCHOR.y + W / 2, R_PIN * 0.8, val ? BLACK : GRAY);
      }
    }
  }
}

function clockImage(cube: PuzzleInterface, DIM: number) {
  const W = DIM * 2.2;
  const ctx = new SVGGenerator(W, DIM);

  const PINS1 = cube.raw[0];
  const PINS2 = cube.raw[0].map((e: any, p: number) => !PINS1[((p >> 1) << 1) + 1 - (p & 1)]);
  const MAT = cube.raw[1];
  const RAD = DIM / 2;

  const BLACK = cube.palette.black;
  const WHITE = cube.palette.white;
  const GRAY = cube.palette.gray;

  drawSingleClock(ctx, RAD, RAD, RAD, MAT[0], PINS2, BLACK, WHITE, GRAY);
  drawSingleClock(ctx, RAD, W - RAD, RAD, MAT[1], PINS1, WHITE, BLACK, GRAY);

  return ctx.getImage();
}

export function CLOCK(): PuzzleInterface {
  let clock: PuzzleInterface = {
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

  let pins: boolean[] = [false, false, false, false];
  let clocks = [
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

  let add = function (i: number, j: number, k: number, val: number) {
    clocks[i][j][k] = (((clocks[i][j][k] + val) % 12) + 12) % 12;
  };

  let mat = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  clock.move = function (moves: any[]) {
    let first = true;
    let upFace = 0;
    for (let i = 0, maxi = moves.length; i < maxi; i += 1) {
      let mv = moves[i];
      let pinCode = mv[0];
      let up = mv[1];
      let down = mv[2];

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
          let x = j >> 1;
          let y = j & 1;
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
