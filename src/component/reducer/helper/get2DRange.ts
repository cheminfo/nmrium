import { get2DXScale, get2DYScale } from '../../2d/utilities/scale';

export interface ZoneBoundary {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function get2DRange(draft, options: ZoneBoundary) {
  const { startX, startY, endX, endY } = options;
  const scaleX = get2DXScale(draft);
  const scaleY = get2DYScale(draft);
  const x1 = startX * 1000000 > endX * 1000000 ? endX : startX;
  const x2 = startX * 1000000 > endX * 1000000 ? startX : endX;
  const y1 = startY * 1000000 > endY * 1000000 ? endY : startY;
  const y2 = startY * 1000000 > endY * 1000000 ? startY : endY;

  const fromY = scaleY.invert(y1);
  const fromX = scaleX.invert(x1);
  const toY = scaleY.invert(y2);
  const toX = scaleX.invert(x2);
  return { fromX, fromY, toX, toY };
}
