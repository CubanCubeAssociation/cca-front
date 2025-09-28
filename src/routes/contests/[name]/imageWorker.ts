import { Puzzle } from "@classes/puzzle/puzzle";
import { options } from "@constants";
import { pGenerateCubeBundle } from "@helpers/cube-draw";

self.onmessage = event => {
  const cats = event.data;
  let puzzles: Puzzle[] = [];

  for (let i = 0, maxi = cats.length; i < maxi; i += 1) {
    let op = options.get(cats[i].category.scrambler || "333") || { type: "rubik" };
    if (!Array.isArray(op)) {
      op.rounded = true;
      puzzles.push(...cats[i].scrambles.map((scr: any) => Puzzle.fromSequence(scr, op)));
    }
  }

  let images: string[][] = [];

  let imgs = pGenerateCubeBundle(puzzles);

  for (let i = 0, maxi = cats.length; i < maxi; i += 1) {
    let scrs = cats[i].scrambles.length;
    images.push([]);
    for (let j = 0, maxj = scrs; j < maxj; j += 1) {
      images[i].push(imgs.shift() || "");
    }
  }

  self.postMessage(images);
};
