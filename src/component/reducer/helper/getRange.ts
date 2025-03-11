import { getXScale } from '../../1d/utilities/scale.js';

interface RangeOptions {
  startX: number;
  endX: number;
}

export function sortRange(start: number, end: number): [number, number] {
  return start > end ? [end, start] : [start, end];
}

export default function getRange(
  draft,
  options: RangeOptions,
): [number, number] {
  const { startX, endX } = options;
  const scaleX = getXScale(draft);

  const start = scaleX.invert(startX);
  const end = scaleX.invert(endX);
  return sortRange(start, end);
}
