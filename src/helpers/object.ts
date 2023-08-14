export function checkPath(obj: any, path: string[], useMap: boolean = false): boolean {
  if ( typeof obj === 'undefined' ) return false;

  let tmp = obj;

  for ( let i = 0, maxi = path.length; i < maxi; i += 1 ) {
    if ( useMap && tmp.has( path[i] ) ) {
      console.log('useMap: ', path[i]);
      tmp = tmp.get( path[i] );
    } else if ( !useMap && Object.prototype.hasOwnProperty.call(tmp, path[i]) ) {
      console.log('!useMap: ', path[i]);
      tmp = tmp[ path[i] ];
    } else {
      return false;
    }
  }

  return true;
}

export function createPath(obj: any, path: string[], def: any, useMap: boolean = false): any {
  if ( typeof obj === 'undefined' ) return obj;

  const objSetter = (o: any, p: any, v: any) => o[p] = v;
  const mapSetter = (m: Map<any, any>, p: any, v: any) => m.set(p, v);

  path.reduce((acc, p, pos) => {
    let altV = pos + 1 === path.length
      ? def
      : useMap
        ? new Map<string, any>()
        : {};

    if ( (!pos && acc instanceof Map) || (pos && useMap) ) {
      mapSetter(acc, p, altV); 
    } else {
      objSetter(acc, p, acc[p] || altV);
    }

    return acc instanceof Map ? acc.get(p) : acc[p];
  }, obj);

  return obj;
}

type MODEL = 'CONTEST' | 'SOLVE' | 'USER' | 'CATEGORY';

export function fromModel(obj: any, model: MODEL) {
  const REFS: { [k:string]: string[] } = {
    CATEGORY: [],
    SOLVE: [ "contest", "category", "user", "scrambler", "judge" ],
    USER: [],
    CONTEST: [ "categories", "paidUsers", "solves" ],
  };

  const RMODEL = REFS[ model ];

  let res: any = {};
  let entries = Object.entries(obj);

  for (let i = 0, maxi = entries.length; i < maxi; i += 1) {
    let { 0: k, 1: v } = entries[i] as any;

    if ( model === 'CONTEST' && k === "contestants" ) {
      res[k] = v.map((e: any) => ({
        user: e.user.id,
        categories: e.categories.map((e1: any) => e1.id || e1)
      }));
    } else if ( RMODEL.indexOf( k ) > -1 ) {
      res[k] = v.map((e: any) => typeof e === 'string' ? e : e.id);
    } else {
      res[k] = v;
    }
  }

  return res;
}

export function uniqueArray(arr: any[], cr: (...args: any) => any): any[] {
  let key = new Set();
  let crs = arr.map(cr);

  arr.forEach((_, p) => key.add( crs[p] ) );

  return arr.filter((_, p) => {
    if ( !key.has( crs[p] ) ) return false;
    
    key.delete( crs[p] );
    return true;
  })
}