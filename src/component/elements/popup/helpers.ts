export function groupBy<T>(array: Array<T>, fn: (item: T) => string) {
  const result: Record<string, Array<T>> = {};
  array.forEach((item) => {
    const key = fn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  });
  return result;
}
