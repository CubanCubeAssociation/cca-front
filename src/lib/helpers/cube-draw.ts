import { Puzzle } from "@classes/puzzle/puzzle";
import { planView } from "./imageGenerators/plainView";
import { projectedView } from "./imageGenerators/projectedView";
import { birdView } from "./imageGenerators/birdView";
import { browser } from "$app/environment";

export async function pGenerateCubeBundle(
  cubes: Puzzle[],
  width?: number,
  inCube = false,
  printable = false
): Promise<string[]> {
  if (!browser) {
    return cubes.map(() => "");
  }

  for (let i = 0, maxi = cubes.length; i < maxi; i += 1) {
    const W = width || 250;
    const cube = cubes[i];

    if (["plan", "2d", "bird"].indexOf(cube.view) > -1) {
      cube.img =
        cube.view === "plan"
          ? planView(cube, W)
          : cube.view === "2d"
            ? projectedView({ cube, DIM: W, printMode: printable })
            : birdView(cube, W);
    }
  }

  if (inCube) return [];
  return cubes.map(c => c.img);
}
