export function createPath(
    obj: any, path: string[], def: any, useMap: boolean = false
  ): any {
  
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