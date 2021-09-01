export const ConcatenationString = '___';

export function buildID(prefix: string, suffix: string): string {
  return `${prefix}${ConcatenationString}${suffix}`;
}
