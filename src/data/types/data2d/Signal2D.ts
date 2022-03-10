import { NMRSignal2D } from 'nmr-processing';
import { Signal2DAxisData } from './Signal2DAxisData';

export interface Signal2D extends Omit<NMRSignal2D, 'id' | 'x' | 'y'> {
  id: string;
  x: Signal2DAxisData;
  y: Signal2DAxisData;
}
