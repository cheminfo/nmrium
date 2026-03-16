/**
 * To use with `lodash.mergeWith`.
 * Instead, merging arrays, it will replace them.
 * @param obj
 * @param src
 */
export function mergeReplaceArray(obj: unknown, src: unknown) {
  if (!Array.isArray(obj)) return;
  if (!Array.isArray(src)) return;

  return src;
}
