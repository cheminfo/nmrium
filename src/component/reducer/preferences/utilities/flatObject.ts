export function flatObject(data: any) {
  let result = {};
  JSON.parse(JSON.stringify(data), (key, value) => {
    if (value?.hidden !== true && key) {
      result[key] = result[key]++ || 1;
    }
  });
  return result;
}
