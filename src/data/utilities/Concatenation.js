export const ConcatenationString = '___';

export function buildID(prefix, suffix) {
  return `${prefix}${ConcatenationString}${suffix}`;
}
