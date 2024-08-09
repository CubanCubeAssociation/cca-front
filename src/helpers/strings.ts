import type { CONTEST } from "@interfaces";
import type { Indicator } from "flowbite-svelte";

export function getSearchParams(loc: string): Map<string, string> {
  return loc.slice(1).split("&").reduce((m, e) => {
    let p = e.split("=").map(s => decodeURIComponent(s));
    m.set(p[0], p[1]);
    return m;
  }, new Map());
}

// Process Keybindings signature
// Copy scramble [Ctrl + C]
export function processKey(str: string) {
  let m = str.match(/\[.*\]$/);

  if ( m ) {
    return [ str.slice(0, m.index).trim(), m[0] ];
  }
  return [str, ''];
}

export function getStatus(st: CONTEST['status']): string {
  if ( st === 'pending' ) return 'Pendiente';
  if ( st === 'inscription' ) return 'Inscripción';
  if ( st === 'running' ) return 'En curso';
  if ( st === 'results' ) return 'Resultados';
  if ( st === 'finished' ) return 'Finalizada';
  return '-';
}

export function getIndicatorColor(st: CONTEST['status']): InstanceType<typeof Indicator>['$$prop_def']['color'] {
  if ( st === 'pending' ) return 'yellow';
  if ( st === 'inscription' ) return 'blue';
  if ( st === 'running' ) return 'green';
  if ( st === 'results' ) return 'purple';
  if ( st === 'finished' ) return 'red';
  return "gray";
}

export function weakRandomUUID() {
  return Math.random().toString(36).slice(2);
}

export function randomUUID() {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  let lens = [8, 4, 4, 4, 12];
  let res: string[][] = [];

  for (let i = 0; i < 5; i += 1) {
    res[i] = [];

    for (let j = 0; j < lens[i]; j += 1) {
      res[i].push(Math.random().toString(16).slice(2));
    }
  }

  return res.map(s => s.join("")).join("-");
}