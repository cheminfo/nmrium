import { NMRPeak1D } from 'nmr-processing';

export interface Peak extends NMRPeak1D {
  id: string;
  originalX: number;
}
