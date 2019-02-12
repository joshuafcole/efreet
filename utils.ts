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

export function now() {
  if(typeof window !== "undefined" && window.performance) {
    return window.performance.now();
  }
  return (new Date()).getTime();
}


function get_min_depth(lines:string[]) {
  if(!lines.length) return Infinity;

  let min_pad = Infinity;
  for(let line of lines) {
    if(!line.trim()) continue; // Ignore empty lines.
    let ix = 0;
    for(let char of line) {
      if(char === " ") ix += 1;
      else break;
    }
    if(ix < min_pad) min_pad = ix;
  }

  return min_pad;
}

/** Unpads a template string to match the least-indented non-blank line. */
export function unpad(template:TemplateStringsArray, ...exprs:any[]) {
  let str = template.reduce((memo, part, ix) => memo + exprs[ix - 1] + part);
  let lines = str.split("\n");
  let min_pad = get_min_depth(lines);
  if(min_pad < Infinity) {
    let trimmed:string[] = [];
    for(let line of lines) {
      trimmed.push(line.slice(min_pad));
    }
    return trimmed.join("\n");
  }
  return str;
}

/** Excise trailing whitespace. */
export function rtrim(str:string) {
  let ix =  str.length - 1;
  while(ix >= 0 && (str[ix] === " " || str[ix] === "\n" || str[ix] === "\t")) ix -= 1;
  return str.slice(0, ix + 1);
}

export function repeat(count:number, text:string = " ") {
  let padding = "";
  for(let ix = 0; ix < count; ix += 1) padding += text;
  return padding;
}

/** Add the specified amount of whitespace immediately after every newline. */
export function pad_lines(pad:number, text:string) {
  let padding = repeat(pad);
  return padding + text.split("\n").join("\n" + padding);
}

/** Format an inline code chunk by unpadding it, trimming trailing whitespace, and dropping the leading newline. */
export function inline_chunk(template:TemplateStringsArray, ...exprs:any[]) {
  let chunk = ""
  for(let ix = 0; ix < template.length; ix += 1) {
    let expr = exprs[ix - 1];
    if(typeof expr === "string") expr = expr.split("\n");
    if(expr instanceof Array) {
      let last_newline = chunk.lastIndexOf("\n");
      if(last_newline !== -1) {
        let char_ix = last_newline + 1;
        for(; char_ix < chunk.length; char_ix += 1) {
          if(chunk[char_ix] !== " ") break;
        }
        let pad = char_ix - last_newline - 1;
        if(pad > 0) expr = expr.join("\n" + repeat(pad));
      }
    }
    chunk += (expr || "") + template[ix];
  }
  let lines = rtrim(chunk).split("\n");
  let min_pad = get_min_depth(lines);
  if(min_pad < Infinity) {
    let trimmed:string[] = [];
    for(let line of lines) {
      trimmed.push(line.slice(min_pad));
    }
    chunk = trimmed.join("\n");
  }

  if(chunk[0] === "\n") return chunk.slice(1);
  return chunk;
}

/** Format an indented code chunk by applying inline pad and then adding `pad` spaces before each line. */
export function pad_chunk(pad:number) {
  return (template:TemplateStringsArray, ...exprs:any[]) => {
    return pad_lines(pad, inline_chunk(template, ...exprs));
  };
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
