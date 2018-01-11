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
    let trimmed = [];
    for(let line of lines) {
      trimmed.push(line.slice(minPad));
    }
    return trimmed.join("\n");
  }
  return str;
}
