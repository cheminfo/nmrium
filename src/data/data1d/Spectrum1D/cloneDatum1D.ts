export function cloneDatum1D(datum) {
  const { x, re, im } = datum || { x: [], re: [], im: [] };
  return { x: x.slice(), re: re.slice(), im: im?.slice() || null };
}
