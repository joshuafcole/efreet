/** Used to avoid extraneous branching where arrays may not exist. */
export const EMPTY = [] as never[];

/** Map of common keycodes. */
export const Keys = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  control: 17,
  alt: 18,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  super: 91,
  a: 65,
  z: 90,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
}

/** Unpads a template string to match the least-indented non-blank line. */
export function unpad(template:TemplateStringsArray, ...exprs:any[]) {
  let str = template.reduce((memo, part, ix) => memo + exprs[ix - 1] + part);
  let lines = str.split("\n");
  if(lines[0].length) return str;
  lines.shift(); // Toss out the starting newline.
  var minPad = Infinity;
  for(let line of lines) {
    if(line === "") continue;
    let ix = 0;
    for(let char of line) {
      if(char === " ") ix += 1;
      else break;
    }
    if(ix === line.length) continue;
    if(ix < minPad) minPad = ix;
  }
  if(minPad < Infinity) {
    let trimmed:string[] = [];
    for(let line of lines) {
      trimmed.push(line.slice(minPad));
    }
    return trimmed.join("\n");
  }
  return str;
}

/** Deep clone an object, preserving it's prototype hierarchy. */
export function clone<T>(instance: T): T {
  if(typeof instance !== "object") return instance;
  if("clone" in instance) return (instance as any).clone();
  if(instance.constructor === Array) return (instance as any).map((v:any) => v);
  let copy = new (instance.constructor as { new (): T })();
  for(let key in instance) {
    if(!instance.hasOwnProperty(key)) continue;
    copy[key] = clone(instance[key]);
  }
  return copy;
}
