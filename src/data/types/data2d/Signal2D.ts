export interface Signal2D {
  id: string;
  peaks: any;
  x: Partial<{
    originDelta: number;
    delta: number;
    diaIDs?: string[];
    nbAtoms?: number;
  }>;
  y: Partial<{
    originDelta: number;
    delta: number;
    diaIDs?: string[];
    nbAtoms?: number;
  }>;
  kind: string;
}
