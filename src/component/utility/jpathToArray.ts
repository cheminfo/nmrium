export function jpathToArray(jpath: string, separator = '.') {
  const keys: string[] = [];
  let key = '';
  let findSeparator = false;
  const length = jpath.length;
  for (let i = 0; i <= length; i++) {
    if (jpath[i] === separator || i === length) {
      if (!findSeparator) {
        keys.push(key);
        key = '';
        findSeparator = true;
      } else {
        key += jpath[i];
      }
    } else {
      findSeparator = false;
      key += jpath[i];
    }
  }
  return keys;
}
