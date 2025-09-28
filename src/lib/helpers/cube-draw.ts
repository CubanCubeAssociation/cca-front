import { Puzzle } from "@classes/puzzle/puzzle";
import { planView } from "./imageGenerators/plainView";
import { projectedView } from "./imageGenerators/projectedView";
import { birdView } from "./imageGenerators/birdView";
import { browser } from "$app/environment";

export function pGenerateCubeBundle(cubes: Puzzle[], width?: number, inCube = false): string[] {
  if (!browser) {
    return cubes.map(() => "");
  }

  for (let i = 0, maxi = cubes.length; i < maxi; i += 1) {
    const W = width || 250;
    const cube = cubes[i];
    // console.time("image-" + cube.type);

    if (["plan", "2d", "bird"].indexOf(cube.view) > -1) {
      cube.img =
        cube.view === "plan"
          ? planView(cube, W)
          : cube.view === "2d"
            ? cube.p.getImage
              ? cube.p.getImage()
              : projectedView({ cube, DIM: W })
            : birdView(cube, W);
    }
    // console.timeEnd("image-" + cube.type);
  }

  if (inCube) return [];
  return cubes.map(c => c.img);
}
