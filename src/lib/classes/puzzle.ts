import { parseReconstruction } from "@helpers/strings";
import type { PuzzleType } from "@interfaces";
import { ScrambleParser } from "./scramble-parser";

export class Puzzle {
  static inverse(type: PuzzleType, sequence: string): string {
    let arr: string[] = [];
    let res = [];

    if (type === "clock") {
      res = sequence
        .split(" ")
        .filter(s => !/^[UD][RL]$/.test(s) && s.trim())
        .reverse()
        .map(s =>
          s.endsWith("0+") || s === "y2"
            ? s
            : s.slice(0, -1) + { "+": "-", "-": "+" }[s[s.length - 1]]
        );
    } else if (type === "square1") {
      const sqre = /\s*\(?(-?\d+), *(-?\d+)\)?\s*/;

      arr = sequence.replace(/\s+/g, "").split("/");

      for (let i = arr.length - 1; i >= 0; i -= 1) {
        const m = arr[i].match(sqre);
        if (m) {
          res.push(`(${-m[1]}, ${-m[2]})`);
        }
        if (i > 0) {
          res.push("/");
        }
      }
    } else if (type === "megaminx") {
      arr = parseReconstruction(sequence, type, 3).sequence;

      for (let i = arr.length - 1; i >= 0; i -= 1) {
        const mv = arr[i];

        if (/^([LRDlrd](\+|-){1,2})$/.test(mv)) {
          res.push(
            mv[0] +
              (mv[1] === "+" ? mv.slice(1).replaceAll("+", "-") : mv.slice(1).replaceAll("-", "+"))
          );
        } else {
          const turns =
            (5 -
              (((parseInt(mv.replace(/\D*(\d+)\D*/g, "$1")) || 1) *
                Math.sign(mv.indexOf("'") + 0.2)) %
                5)) %
            5;

          if (/^([ULFRBDy]\d*'?)$/.test(mv)) {
            res.push(
              `${mv[0]}${turns === 1 || turns === -1 ? "" : Math.abs(turns)}${turns < 0 ? "" : "'"}`
            );
          } else if (/^([dbDB][RL]\d*'?)$/.test(mv)) {
            res.push(
              `${mv.slice(0, 2)}${turns === 1 || turns === -1 ? "" : Math.abs(turns)}${
                turns < 0 ? "" : "'"
              }`
            );
          } else if (/^(DB[RL]\d*'?)$/.test(mv)) {
            res.push(
              `${mv.slice(0, 3)}${turns === 1 || turns === -1 ? "" : Math.abs(turns)}${
                turns < 0 ? "" : "'"
              }`
            );
          } else {
            res.push(
              `[${mv[1]}${turns === 1 || turns === -1 ? "" : Math.abs(turns)}${
                turns < 0 ? "" : "'"
              }]`
            );
          }
        }
      }
    } else {
      const fn =
        type === "pyraminx" ? ScrambleParser.parsePyraminxString : ScrambleParser.parseNNNString;
      const arr = fn(sequence)
        .trim()
        .split(" ")
        .map(e => e.trim())
        .filter(e => e != "");

      for (let i = arr.length - 1; i >= 0; i -= 1) {
        if (arr[i].indexOf("2") > -1) {
          res.push(arr[i].replace("'", ""));
        } else if (arr[i].indexOf("'") > -1) {
          res.push(arr[i].replace("'", ""));
        } else {
          res.push(arr[i] + "'");
        }
      }
    }

    return res.join(" ");
  }
}
