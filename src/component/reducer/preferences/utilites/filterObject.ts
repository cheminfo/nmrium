export function filterObject(data: any) {
  return JSON.parse(JSON.stringify(data), (key, value) => {
    if (value?.hidden !== true) {
      return value;
    }
  });
}
