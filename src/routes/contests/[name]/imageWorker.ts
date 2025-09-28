import { Puzzle } from "@classes/puzzle/puzzle";
import { options } from "@constants";
import { pGenerateCubeBundle } from "@helpers/cube-draw";

self.onmessage = event => {
  const cats = event.data;
  const puzzles: Puzzle[] = [];

  // console.time("puzzleInit");
  for (let i = 0, maxi = cats.length; i < maxi; i += 1) {
    const op = options.get(cats[i].category.scrambler || "333") || { type: "rubik" };
    if (!Array.isArray(op)) {
      // console.time(`${cats[i].category.name}`);
      op.rounded = true;
      puzzles.push(...cats[i].scrambles.map((scr: any) => Puzzle.fromSequence(scr, op)));
      // console.timeEnd(`${cats[i].category.name}`);
    }
  }
  // console.timeEnd("puzzleInit");

  const images: string[][] = [];

  // console.time("genImage");
  const imgs = pGenerateCubeBundle(puzzles);
  // console.timeEnd("genImage");

  for (let i = 0, maxi = cats.length; i < maxi; i += 1) {
    const scrs = cats[i].scrambles.length;
    images.push([]);
    for (let j = 0, maxj = scrs; j < maxj; j += 1) {
      images[i].push(imgs.shift() || "");
    }
  }

  self.postMessage(images);
};
