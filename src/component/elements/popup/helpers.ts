export function groupBy(
  array: Array<any>,
  fn: (item: any) => string,
): Array<any> {
  return array.reduce((result, item) => {
    const key = fn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
    return result;
  }, {});
}
