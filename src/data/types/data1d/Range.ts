import { Signal1D } from './Signal1D';

export interface Range {
  id: string;
  originFrom?: number;
  originTo?: number;
  from: number;
  to: number;
  absolute: number;
  integration: number;
  kind: string;
  signals: Array<Signal1D>;
  diaIDs?: string[];
  nbAtoms?: number;
}
