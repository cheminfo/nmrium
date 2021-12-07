import { NMRSignal1D } from 'nmr-processing';

export interface Signal1D extends Omit<NMRSignal1D, 'id'> {
  id: string;
  originDelta?: number;
}
