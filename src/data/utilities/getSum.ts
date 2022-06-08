/**
 * Sum values for specific key in the object
 * @param values array of object
 * @param key key
 * @param check custom check function to to indicate if certain object included or not in the summation
 * @returns number
 */

export function getSum<Type>(
  values: Type[],
  key: keyof Extract<Type, string>,
  check: ((value: Type) => boolean) | null = null,
) {
  return values.reduce((sum, current) => {
    return check?.(current) ? (sum += Math.abs(current[key as string])) : sum;
  }, 0);
}
