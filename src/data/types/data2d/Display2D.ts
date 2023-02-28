import { ContourOptions } from './ContourOptions';

export interface Color2D {
  positiveColor: string;
  negativeColor: string;
}
export interface Display2D extends Color2D {
  name: string;
  isVisible: boolean;
  isPositiveVisible: boolean;
  isNegativeVisible: boolean;
  contourOptions: ContourOptions;
}
