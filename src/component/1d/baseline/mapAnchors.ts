export interface AnchorData {
  x: number;
  id: string;
}
export function mapAnchors(anchors: AnchorData[]) {
  const sorted = anchors.toSorted((a, b) => a.x - b.x);
  const resultX = sorted.map((a) => a.x);
  return resultX;
}
