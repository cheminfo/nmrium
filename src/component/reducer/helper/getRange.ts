import { getXScale } from '../../1d/utilities/scale';

interface RangeOptions {
  startX: number;
  endX: number;
}

export default function getRange(
  draft,
  options: RangeOptions,
): [number, number] {
  const { startX, endX } = options;
  const scaleX = getXScale(draft);

  const start = scaleX.invert(startX);
  const end = scaleX.invert(endX);
  const range: [number, number] = [0, 0];
  if (start > end) {
    range[0] = end;
    range[1] = start;
  } else {
    range[0] = start;
    range[1] = end;
  }
  return range;
}
