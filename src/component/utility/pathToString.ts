export function pathToString(path: string[]) {
  return Array.isArray(path) ? path.join('.') : '';
}
