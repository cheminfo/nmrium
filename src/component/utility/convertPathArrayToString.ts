export function convertPathArrayToString(value: string | string[]) {
  return Array.isArray(value) ? value.join('.') : value;
}
