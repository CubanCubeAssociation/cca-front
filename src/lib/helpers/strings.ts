import { ScrambleParser } from "@classes/scramble-parser";
import { Interpreter } from "@classes/scrambleInterpreter";
import {
  PENALTY,
  type CONTEST,
  type IReconstruction,
  type PuzzleType,
  type TAG,
} from "@interfaces";
import { newArr } from "./object";

export function getSearchParams(loc: string): Map<string, string> {
  return loc
    .slice(1)
    .split("&")
    .reduce((m, e) => {
      const p = e.split("=").map(s => decodeURIComponent(s));
      m.set(p[0], p[1]);
      return m;
    }, new Map());
}

// Process Keybindings signature
// Copy scramble [Ctrl + C]
export function processKey(str: string) {
  const m = str.match(/\[.*\]$/);

  if (m) {
    return [str.slice(0, m.index).trim(), m[0]];
  }
  return [str, ""];
}

export function getStatus(st: CONTEST["status"]): string {
  if (st === "pending") return "Pendiente";
  if (st === "inscription") return "Inscripción";
  if (st === "running") return "En curso";
  if (st === "results") return "Resultados";
  if (st === "finished") return "Finalizada";
  return "-";
}

export function getIndicatorColor(st: CONTEST["status"]) {
  if (st === "pending") return "status-warning";
  if (st === "inscription") return "status-info";
  if (st === "running") return "status-accent";
  if (st === "results") return "status-primary";
  if (st === "finished") return "status-error";
  return "gray";
}

export function weakRandomUUID() {
  return Math.random().toString(36).slice(2);
}

export function randomUUID() {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const lens = [8, 4, 4, 4, 12];
  const res: string[][] = [];

  for (let i = 0; i < 5; i += 1) {
    res[i] = [];

    for (let j = 0; j < lens[i]; j += 1) {
      res[i].push(Math.random().toString(16).slice(2));
    }
  }

  return res.map(s => s.join("")).join("-");
}

export function getReturnURL(url: URL): string {
  return url.href.slice(url.origin.length);
}

export function getPenaltyName(p: PENALTY): string {
  switch (p) {
    case PENALTY.NONE:
      return "-";
    case PENALTY.DNF:
      return "DNF";
    case PENALTY.DNS:
      return "DNS";
    case PENALTY.P2:
      return "+2";
  }
}

export function defaultInner(s: string, withSuffix = true) {
  return s.replace(/\n/g, "<br>") + (withSuffix ? "<br>" : "");
}

type IToken = ReturnType<Interpreter["getTree"]>["program"];

export function getTreeString(token: IToken, puzzle: PuzzleType): string {
  const { value } = token;

  switch (token.type) {
    case "Move": {
      if (puzzle === "square1" && token.value != "/") {
        const regs = [
          /^(\()(\s*)(-?\d)(,)(\s*)(-?\d)(\s*)(\))/,
          /^(-?\d)(,)(\s*)(-?\d)/,
          /^(-?\d)(-?\d)/,
          /^(-?\d)/,
        ];
        const operators = /^[(,)]$/;

        for (let i = 0, maxi = regs.length; i < maxi; i += 1) {
          const m = regs[i].exec(value);

          if (m) {
            return m
              .slice(1)
              .map(s =>
                operators.test(s)
                  ? `<span class="operator" data-cursor="${token.cursor}">${s}</span>`
                  : /\d$/.test(s)
                    ? s === "0"
                      ? `<span class="move silent">${s}</span>`
                      : `<span class="move" data-cursor="${token.cursor}">${s}</span>`
                    : defaultInner(s, false)
              )
              .join("");
          }
        }
      }
      return `<span class="move" data-cursor="${token.cursor}">${defaultInner(
        value,
        false
      )}</span>`;
    }

    case "Comment": {
      return `<span class="comment" data-cursor="${token.cursor}">${defaultInner(
        value,
        false
      )}</span>`;
    }

    case "Space": {
      return defaultInner(value, false);
    }

    case "Expression": {
      return (value as IToken[]).map(t => getTreeString(t, puzzle)).join("");
    }

    case "ParentesizedExpression": {
      return (
        `<span class="operator" data-cursor="${token.cursor}">(</span>` +
        getTreeString(value.expr, puzzle) +
        `<span class="operator" data-cursor="${token.cursor}">)</span>` +
        (value.cant != 1 || value.explicit
          ? `<span class="operator" data-cursor="${token.cursor}">${value.cant}</span>`
          : "")
      );
    }

    case "ConmutatorExpression": {
      if (value.setup) {
        return (
          `<span class="operator" data-cursor="${token.cursor}">[</span>` +
          getTreeString(value.setup, puzzle) +
          `<span class="operator" data-cursor="${token.cursor}">:</span>` +
          getTreeString(value.conmutator, puzzle) +
          `<span class="operator" data-cursor="${token.cursor}">]</span>` +
          (value.cant != 1 || value.explicit
            ? `<span class="operator" data-cursor="${token.cursor}">${value.cant}</span>`
            : "")
        );
      }

      return (
        `<span class="operator" data-cursor="${token.cursor}">[</span>` +
        getTreeString(value.expr1, puzzle) +
        `<span class="operator" data-cursor="${token.cursor}">,</span>` +
        getTreeString(value.expr2, puzzle) +
        `<span class="operator" data-cursor="${token.cursor}">]</span>` +
        (value.cant != 1 || value.explicit
          ? `<span class="operator" data-cursor="${token.cursor}">${value.cant}</span>`
          : "")
      );
    }
  }

  return "";
}

function getMoveLength(sequence: string[], puzzle: PuzzleType, order: number): number {
  try {
    switch (puzzle) {
      case "rubik":
      case "mirror":
      case "void": {
        return sequence.reduce(
          (acc: any[], e) => [
            ...acc,
            ...ScrambleParser.parseNNN(e, { a: order, b: order, c: order }),
          ],
          []
        ).length;
      }

      case "skewb": {
        return sequence.reduce((acc: any[], e) => [...acc, ...ScrambleParser.parseSkewb(e)], [])
          .length;
      }

      case "square1": {
        return sequence.reduce((acc: any[], e) => [...acc, ...ScrambleParser.parseSquare1(e)], [])
          .length;
      }

      case "megaminx": {
        return sequence.reduce((acc: any[], e) => [...acc, ...ScrambleParser.parseMegaminx(e)], [])
          .length;
      }

      case "pyraminx": {
        return sequence.reduce((acc: any[], e) => [...acc, ...ScrambleParser.parsePyraminx(e)], [])
          .length;
      }

      case "clock": {
        return ScrambleParser.parseClock(sequence.join(" ")).length;
      }

      case "masterskewb": {
        return ScrambleParser.parseSkewb(sequence.join(" ")).length;
      }

      case "helicopter": {
        return sequence.reduce((acc: any[], e) => [...acc, ...e.split(/\s+/)], []).length;
      }
    }
  } catch {
    void 0;
  }

  return 0;
}

export function parseReconstruction(s: string, puzzle: PuzzleType, order: number): IReconstruction {
  const itp = new Interpreter(false, puzzle);

  let errorCursor = -1;

  try {
    const tree = itp.getTree(s);

    if (tree.error) {
      errorCursor = typeof tree.cursor === "number" ? tree.cursor : 0;
    } else {
      const program = itp.getFlat(tree.program);
      const flat = program.filter(token => token.cursor >= 0);

      const sequence: string[] = flat.map(token => token.value);
      let sequenceIndex: number[] = [];
      const finalAlpha = getMoveLength(sequence, puzzle, order);

      switch (puzzle) {
        case "square1": {
          sequenceIndex = newArr(finalAlpha)
            .fill(0)
            .map((_, i) => i);
          break;
        }

        default: {
          sequenceIndex = flat.map(token => token.cursor);
        }
      }

      return {
        result: getTreeString(tree.program.value, puzzle) + "<br>",
        finalAlpha,
        sequence,
        sequenceIndex,
        hasError: false,
      };
    }
  } catch (e) {
    if (typeof e === "number") {
      errorCursor = e;
    }
  }

  if (errorCursor != -1) {
    const pref = defaultInner(s.slice(0, errorCursor), false);
    let middle = "";
    const match = /^([^\s\n]+)/.exec(s.slice(errorCursor));

    if (match) {
      middle = `<span class="error">${match[0]}</span>`;
      return {
        result: pref + middle + defaultInner(s.slice(errorCursor + match[0].length)),
        finalAlpha: 0,
        sequence: [],
        sequenceIndex: [],
        hasError: true,
      };
    }
  }

  return {
    result: defaultInner(s),
    finalAlpha: 0,
    sequence: [],
    sequenceIndex: [],
    hasError: false,
  };
}

export function prettyScramble(scramble: string): string {
  return scramble
    .trim()
    .replace(/\s*<br>\s*/g, "\n")
    .replace(/(\n\s+)/g, "\n");
}

export function getTagDescription(t: TAG | (string & {}), short = false): string {
  if (t === "NR") return ["Récord Nacional", t][short ? 1 : 0];
  if (t === "PR") return ["Récord Provincial", t][short ? 1 : 0];
  if (t === "PB") return ["Récord Personal", t][short ? 1 : 0];
  return "";
}

export function randomCSSId() {
  return btoa(randomUUID()).slice(0, 16);
}

export function copyToClipboard(s: string) {
  return navigator.clipboard.writeText(s);
}

export function getShortName(name: string, level: 1 | 2 = 1) {
  let parts: string[] = (name || "").trim().split(" ");
  let res: string[][] = [[]];

  for (let i = 0, maxi = parts.length; i < maxi; i += 1) {
    res[res.length - 1].push(parts[i]);

    if (parts[i][0] === parts[i][0].toUpperCase()) {
      res.push([]);
    }
  }

  res.pop();

  if (level === 2) {
    return [
      ...res[0],
      res
        .slice(1)
        .map(r => r[r.length - 1][0])
        .join("."),
    ].join(" ");
  }

  if (res.length < 3) {
    return res.reduce((acc, e) => [...acc, ...e], []).join(" ");
  }

  return [...res[0], ...res[res.length - 2], ...res[res.length - 1]].join(" ");
}
