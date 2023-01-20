export function prepareKey(val: string | number) {
  return String(val)
    .toLowerCase()
    .trim()
    .replace(/\r?\n|\r/, '');
}
