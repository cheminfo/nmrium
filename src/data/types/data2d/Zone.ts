import { Signal2D } from './Signal2D';

export interface Zone {
  id: string;
  x: Partial<{ from: number; to: number; diaIDs?: string[]; nbAtoms?: number }>;
  y: Partial<{ from: number; to: number; diaIDs?: string[]; nbAtoms?: number }>;
  signals: Array<Signal2D>;
  kind: string;
}
