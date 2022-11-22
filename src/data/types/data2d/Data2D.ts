export interface MinMaxContent {
  z: Array<Array<number>>;
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

export type Data2D = Record<'rr' | 'ii' | 'ri' | 'ir', MinMaxContent>;
