export function convertPathArrayToString(value: any) {
  return Array.isArray(value) ? value.join('.') : value;
}
