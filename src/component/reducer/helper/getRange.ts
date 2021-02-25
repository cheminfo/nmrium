import { getXScale } from '../../1d/utilities/scale';

export default function getRange(draft, options) {
  const { startX, endX } = options;
  const scaleX = getXScale(draft);

  const start = scaleX.invert(startX);
  const end = scaleX.invert(endX);
  const range: number[] = [];
  if (start > end) {
    range[0] = end;
    range[1] = start;
  } else {
    range[0] = start;
    range[1] = end;
  }
  return range;
}
