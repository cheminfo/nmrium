import { Signal2D } from './Signal2D';
import { Zone2DAxisData } from './Zone2DAxisData';

export interface Zone {
  id: string;
  x: Zone2DAxisData;
  y: Zone2DAxisData;
  signals: Array<Signal2D>;
  kind: string;
}
