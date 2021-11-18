export interface Signal1D {
  id: string;
  kind: string;
  originDelta?: number;
  delta: number;
  multiplicity: string;
  peaks?: Array<{ x: number; intensity: number; width: number }>;
  diaIDs?: string[];
  nbAtoms?: number;
}
