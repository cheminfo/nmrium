export function changeKeys(data, changedKeys) {
  return JSON.parse(JSON.stringify(data), function reviver(key, value) {
    if (key in changedKeys) {
      this[changedKeys[key]] = value;
      return;
    }
    return value;
  });
}
