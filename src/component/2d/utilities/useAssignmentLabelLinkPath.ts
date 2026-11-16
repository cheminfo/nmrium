import type { Position } from '../../elements/draggable/useDraggable.js';

import { useScale2DX, useScale2DY } from './scale.js';

interface TargetBoundary {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

interface Boundary {
  width: number;
  height: number;
}

interface FindBestLinkResult {
  sourcePoint: { a: Position; b: Position };
  targetPoint: Position;
  distance: number;
  angle: number;
}

function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function getAngleFromSides(a: number, b: number, c: number) {
  const radians = Math.acos((b ** 2 + c ** 2 - a ** 2) / (2 * b * c));
  return radians * (180 / Math.PI);
}

function findBestLink(
  sourcePoints: Array<{ a: Position; b: Position }>,
  targetPoints: Position[],
): FindBestLinkResult {
  const result: FindBestLinkResult[] = [];

  for (const sourcePoint of sourcePoints) {
    const { a, b } = sourcePoint;
    for (const targetPoint of targetPoints) {
      const { x, y } = targetPoint;
      const aLength = getDistance(a.x, a.y, x, y);
      const bLength = getDistance(b.x, b.y, x, y);
      const deltaLength = getDistance(a.x, a.y, b.x, b.y);
      const distance = Math.min(aLength, bLength);
      const angle = Number(
        getAngleFromSides(deltaLength, aLength, bLength).toFixed(1),
      );
      result.push({ distance, angle, targetPoint, sourcePoint });
    }
  }

  result.sort((a, b) => {
    if (a.angle !== b.angle) return b.angle - a.angle;
    return a.distance - b.distance;
  });
  return result[0];
}

export function useAssignmentLabelLinkPath(
  currentPosition: Position,
  targetBoundary: TargetBoundary,
  sourceElementBoundary: Boundary,
  options: { sideLength?: number; shift?: number } = {},
) {
  const { sideLength = 6, shift = 5 } = options;
  const { x1, x2, y1, y2 } = targetBoundary;
  const { x, y } = currentPosition;
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();
  const { width, height } = sourceElementBoundary;
  const centerX = width / 2;
  const centerY = height / 2;
  const leftX = x - centerX - shift;
  const rightX = x + centerX + shift;
  const topY = y - height;
  const bottomY = y + shift;
  const targetWidth = scaleX(x2) - scaleX(x1);
  const targetHeight = scaleY(y2) - scaleY(y1);
  const targetXCenter = scaleX(x1) + targetWidth / 2;
  const targetYCenter = scaleY(y1) + targetHeight / 2;

  const sourcePoints: Array<{ a: Position; b: Position }> = [
    {
      a: { x, y: bottomY },
      b: { x: x + sideLength, y: bottomY },
    },
    {
      a: { x, y: topY },
      b: { x: x + sideLength, y: topY },
    },
    {
      a: { x: leftX, y: y - centerY - sideLength / 2 },
      b: { x: leftX, y: y - centerY + sideLength / 2 },
    },
    {
      a: { x: rightX, y: y - centerY - sideLength / 2 },
      b: { x: rightX, y: y - centerY + sideLength / 2 },
    },
  ];

  /**
   *  Coordination
   *  xMid= x2-x1/2;
   *  yMid= y2-y1/2;
   * (x1,y1)     ----------  (xMid,y1)  ---------- (x2,y1)
   *    |                                             |
   *    |                                             |
   * (x1,yMid)                                    (x2,yMid)
   *    |                                             |
   *    |                                             |
   * (x1,y2)    ----------   (xMid,y2) ----------  (x2,y2)
   *
   */
  const targetPoints: Position[] = [
    //Left Top

    { x: scaleX(x1), y: scaleY(y1) },
    //Center Top
    { x: targetXCenter, y: scaleY(y1) },
    //Right Top
    { x: scaleX(x2), y: scaleY(y1) },
    //Right Center
    { x: scaleX(x2), y: targetYCenter },
    //Right Bottom
    { x: scaleX(x2), y: scaleY(y2) },
    //Center Bottom
    { x: targetXCenter, y: scaleY(y2) },
    //Left Bottom
    { x: scaleX(x1), y: scaleY(y2) },
    //Left Center
    { x: scaleX(x1), y: targetYCenter },
  ];
  const link = findBestLink(sourcePoints, targetPoints);

  return `${link.sourcePoint.a.x},${link.sourcePoint.a.y} ${link.sourcePoint.b.x},${link.sourcePoint.b.y} ${link.targetPoint.x},${link.targetPoint.y}`;
}
