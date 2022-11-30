export interface MinMaxContent {
  z: Array<Array<number>>;
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

export type Data2D = Data2DFid | Data2DFt;

export interface Data2DFid {
  re: MinMaxContent;
  im?: MinMaxContent;
}

export interface Data2DFt {
  rr: MinMaxContent;
  ri?: MinMaxContent;
  ir?: MinMaxContent;
  ii?: MinMaxContent;
}
